const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../models/User");
const Post = require("../../models/Post");
const ChatMessage = require("../../models/ChatMessage");
const ChatRoom = require("../../models/ChatRoom");
const Correspondence = require("../../models/Correspondence");

const { dateToString } = require("../../helpers/date");

const createToken = (user, secret, expiresIn) => {
  const { username, email, _id } = user;
  return jwt.sign({ username, email, _id }, secret, { expiresIn });
};

const rootResolver = {
  getCurrentUser: async (args, req) => {
    try {
      verifiedToken = jwt.verify(req.body.variables.token, process.env.SECRET);
      let jwtExpirationTimeMilliseconds =
        verifiedToken.exp * 1000 - new Date().getTime();
      const { username } = verifiedToken;
      const user = await User.findOne({
        username: username
      }).populate({
        path: "favorites",
        model: Post
      });
      return { user: user, tokenExpirationTime: jwtExpirationTimeMilliseconds };
    } catch (err) {
      return err;
    }
  },
  getCurrentUserCorrespondence: async (args, req) => {
    const currentUser = jwt.verify(
      req.body.variables.token,
      process.env.SECRET
    );
    const { username, _id } = currentUser;

    // const { username, _id } = req.body.variables;
    const user = await User.findOne({
      username: username
    })
      .populate({
        path: "correspondence",
        model: Correspondence,
        populate: { path: "participants", model: User }
      })
      .populate({
        path: "correspondence",
        model: Correspondence,
        populate: { path: "messages", model: ChatMessage }
      })
      .lean();

    const newCorrespondence = user.correspondence.map(correspondence => {
      correspondence.anotheruser = correspondence.participants.filter(
        participant => {
          return participant._id.toString() !== _id;
        }
      )[0];
      return correspondence;
    });

    return newCorrespondence;
  },
  getPublicChatRooms: async args => {
    const chatRooms = await ChatRoom.find({})
      .sort({ createdDate: "desc" })
      .lean();
    const filteredChatRooms = await chatRooms.filter(
      room => room.private === false
    );
    return filteredChatRooms;
  },
  getPrivateChatRooms: async args => {
    const chatRooms = await ChatRoom.find({}).sort({ createdDate: "desc" });
    const filteredChatRooms = await chatRooms.filter(
      room => room.private === true
    );
    return filteredChatRooms;
  },
  getCurrentChatRoomMessages: async (ars, req) => {
    const { roomId } = req.body.variables;
    const currentChatRoom = await ChatRoom.findById(roomId)
      .populate({ path: "messages", model: ChatMessage })
      .lean();
    // rewrite Date into local date string
    currentChatRoom.messages.map(message => {
      message.createdDate = dateToString(message.createdDate);
      return message;
    });

    return currentChatRoom.messages;
  },
  getCurrentUserCorrespondenceMessages: async (ars, req) => {
    const currentUser = jwt.verify(
      req.body.variables.token,
      process.env.SECRET
    );
    const { _id } = currentUser;
    const { anotheruserid } = req.body.variables;
    const currentCorrespondence = await Correspondence.findOne({
      participants: _id,
      participants: anotheruserid
    })
      .populate({ path: "messages", model: ChatMessage })
      .lean();

    return currentCorrespondence.messages;
  },
  getPosts: async args => {
    const posts = await Post.find({})
      .sort({ createdDate: "desc" })
      .populate({
        path: "createdBy",
        model: "User"
      });
    return posts;
  },
  getPost: async (args, req) => {
    const { postId } = req.body.variables;
    const post = await Post.findOne({ _id: postId }).populate({
      path: "messages.messageUser",
      model: "User"
    });
    return post;
  },
  addPost: async (args, req) => {
    const {
      title,
      imageUrl,
      categories,
      description,
      creatorId
    } = req.body.variables;

    const newPost = await new Post({
      title,
      imageUrl,
      categories,
      description,
      createdBy: creatorId
    }).save();
    return newPost;
  },
  addPostMessage: async (args, req) => {
    const { messageBody, userId, postId } = req.body.variables;
    const newMessage = {
      messageBody,
      messageUser: userId
    };
    const post = await Post.findOneAndUpdate(
      // find post by id
      { _id: postId },
      // prepend (push) new message to beginning of messages array
      { $push: { messages: { $each: [newMessage], $position: 0 } } },
      // return fresh document after update
      { new: true }
    ).populate({
      path: "messages.messageUser",
      model: "User"
    });
    return post.messages[0];
  },
  likePost: async (args, req) => {
    const { postId, username } = req.body.variables;
    // Find Post, add 1 to its 'like' value
    const post = await Post.findOneAndUpdate(
      { _id: postId },
      { $inc: { likes: 1 } },
      { new: true }
    );
    // Find User, add id of post to its favorites array (which will be populated as Posts)
    const user = await User.findOneAndUpdate(
      { username },
      { $addToSet: { favorites: postId } },
      { new: true }
    ).populate({
      path: "favorites",
      model: "Post"
    });
    // Return only likes from 'post' and favorites from 'user'
    return { likes: post.likes, favorites: user.favorites };
  },
  unlikePost: async (args, req) => {
    const { postId, username } = req.body.variables;
    // Find Post, add -1 to its 'like' value
    const post = await Post.findOneAndUpdate(
      { _id: postId },
      { $inc: { likes: -1 } },
      { new: true }
    );
    // Find User, remove id of post from its favorites array (which will be populated as Posts)
    const user = await User.findOneAndUpdate(
      { username },
      { $pull: { favorites: postId } },
      { new: true }
    ).populate({
      path: "favorites",
      model: "Post"
    });
    // Return only likes from 'post' and favorites from 'user'
    return { likes: post.likes, favorites: user.favorites };
  },
  searchPosts: async (args, req) => {
    const { searchTerm } = req.body.variables;
    // console.log(searchTerm);
    if (searchTerm) {
      const searchResults = await Post.find(
        {
          $or: [
            { title: new RegExp(searchTerm, "i") },
            { description: new RegExp(searchTerm, "i") }
          ]
        }
        // Perform text search for search value of 'searchTerm'
        // { $text: { $search: searchTerm } },
        // Assign 'searchTerm' a text score to provide best match
        // { score: { $meta: "textScore" } }
        // Sort results according to that textScore (as well as by likes in descending order)
      )
        .sort({
          // score: { $meta: "textScore" },
          likes: "desc"
        })
        .limit(5);
      return searchResults;
    }
  },
  infiniteScrollPosts: async (args, req) => {
    const { pageNum, pageSize } = req.body.variables;
    let posts;
    if (pageNum === 1) {
      posts = await Post.find({})
        .sort({ createdDate: "desc" })
        .populate({
          path: "createdBy",
          model: "User"
        })
        .limit(pageSize);
    } else {
      // If page number is greater than one, figure out how many documents to skip
      const skips = pageSize * (pageNum - 1);
      posts = await Post.find({})
        .sort({ createdDate: "desc" })
        .populate({
          path: "createdBy",
          model: "User"
        })
        .skip(skips)
        .limit(pageSize);
    }
    const totalDocs = await Post.countDocuments();
    const hasMore = totalDocs > pageSize * pageNum;
    return { posts, hasMore };
  },
  infiniteScrollMessages: async (args, req) => {
    const {
      pageNum,
      pageSize,
      roomid,
      roomtype,
      userid,
      anotheruserid
    } = req.body.variables;

    let chatRoom;
    let skip = pageSize * (pageNum - 1);
    let model;

    if (roomtype !== "correspondence") {
      model = ChatRoom;
    }
    if (roomtype === "correspondence") {
      model = Correspondence;
    }
    if (pageNum === 1) {
      chatRoom = await model
        .findOne({ _id: roomid })
        .populate({
          path: "messages",
          model: "ChatMessage",
          options: {
            limit: pageSize,
            sort: { createdDate: -1 }
          }
        })
        .lean();
      chatRoom.messages.map(message => {
        return (message.createdDate = dateToString(message.createdDate));
      });
    } else {
      // If page number is greater than one, figure out how many documents to skip
      chatRoom = await model
        .findOne({ _id: roomid })
        .populate({
          path: "messages",
          model: "ChatMessage",
          options: {
            limit: pageSize,
            sort: { createdDate: -1 },
            skip: skip
          }
        })
        .lean();
      chatRoom.messages.map(message => {
        return (message.createdDate = dateToString(message.createdDate));
      });
    }

    const totalDocs = await chatRoom.messages.length;

    const hasMore = totalDocs > pageSize * pageNum;
    const { messages } = chatRoom;
    return { messages, hasMore };
  },
  sendChatMessage: async (args, req) => {
    try {
      const inputMessage = await new ChatMessage({
        userid: req.body.variables.userid,
        username: req.body.variables.username,
        message: req.body.variables.message,
        avatar: req.body.variables.avatar,
        private: req.body.variables.private,
        deleted: false
      });
      const messageid = inputMessage._id;
      await ChatRoom.findOneAndUpdate(
        { _id: req.body.variables.roomId },
        { $push: { messages: messageid } },
        { new: true }
      )
        .lean()
        .exec((err, data) => {
          if (err) {
            console.log("Something wrong when data was updating !!");
          }
        });

      if (req.body.variables.userid === undefined) {
        return false;
      }
      await inputMessage.save();
      inputMessage.createdDate = dateToString(inputMessage.createdDate);

      return inputMessage;
    } catch (err) {
      console.log("I am a tea spot: ", err);
    }
  },
  sendPrivateMessage: async (args, req) => {
    try {
      const inputMessage = await new ChatMessage({
        userid: req.body.variables.userid,
        username: req.body.variables.username,
        message: req.body.variables.message,
        avatar: req.body.variables.avatar,
        private: req.body.variables.private,
        deleted: false
      });

      const data = await Correspondence.findOne({
        participants: req.body.variables.userid,
        participants: req.body.variables.anotheruserid
      });

      // if querry don't find correspondence between two users
      if (data === null) {
        // create new correspondence
        console.log("creating NEW Corresp");
        const newCorrespondence = await new Correspondence({
          participants: [
            req.body.variables.userid,
            req.body.variables.anotheruserid
          ],
          messages: [inputMessage._id]
        });
        newCorrespondence.save();

        // find users and push to their correspondences new ones
        await User.findOneAndUpdate(
          { _id: req.body.variables.userid },
          { $push: { correspondence: newCorrespondence._id } },
          { new: true }
        )
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log("Something wrong when updating data!");
            }
          });

        await User.findOneAndUpdate(
          { _id: req.body.variables.anotheruserid },
          { $push: { correspondence: newCorrespondence._id } },
          { new: true }
        )
          .lean()
          .exec((err, data) => {
            if (err) {
              console.log("Something wrong when updating data!");
            }
          });
      }
      // if querry find correspondence push new messages
      if (data !== null) {
        data.messages.push(inputMessage._id);
        data.save();
      }

      await inputMessage.save();
      return inputMessage;
    } catch (err) {
      console.log("PrivateMessage wasn't sent", err);
    }
  },
  addChatRoom: async (args, req) => {
    try {
      const newChatRoom = await new ChatRoom({
        participants: [req.body.variables.userid],
        private: req.body.variables.private,
        title: req.body.variables.title,
        description: req.body.variables.description,
        createdBy: req.body.variables.userid
      }).save();
      const newChatRoomId = newChatRoom._id;
      const user = await User.findById(req.body.variables.userid);
      if (!user) {
        throw new Error("User not found");
      }
      user.chatRooms.push(newChatRoomId);
      user.save();
      return newChatRoom;
    } catch (err) {
      console.log("addChatRoom error", err);
    }
  },
  signinUser: async (args, req) => {
    const user = await User.findOne({ username: req.body.variables.username });
    if (!user) {
      throw new Error("User not found");
    }
    const isValidPassword = await bcryptjs.compare(
      req.body.variables.password,
      user.password
    );
    if (!isValidPassword) {
      throw new Error("Invalid password");
    }
    const token = await {
      token: createToken(user, process.env.SECRET, "24hr")
    };
    return token;
  },
  signupUser: async (args, req) => {
    const username = req.body.variables.username;
    const user = await User.findOne({ username });
    if (user) {
      throw new Error("User already exists");
    }
    const newUser = await new User({
      username: req.body.variables.username,
      email: req.body.variables.email,
      password: req.body.variables.password
    }).save();
    return { token: createToken(newUser, process.env.SECRET, "24hr") };
  }
};

module.exports = rootResolver;
