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
    const currentUser = jwt.verify(
      req.body.variables.token,
      process.env.SECRET
    );
    const { username } = currentUser;

    const user = await User.findOne({
      username: username
    });
    return user;
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
      console.log(_id);
      // correspondence.anotheruser = 2;
      correspondence.anotheruser = correspondence.participants.filter(
        participant => {
          return participant._id.toString() !== _id;
        }
      )[0];
      return correspondence;
    });

    console.log("correspondence after map", newCorrespondence);
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
    console.log(_id, anotheruserid);
    const currentCorrespondence = await Correspondence.findOne({
      participants: _id,
      participants: anotheruserid
    })
      .populate({ path: "messages", model: ChatMessage })
      .lean();

    // rewrite Date into local date string

    currentCorrespondence.messages.map(message => {
      message.createdDate = dateToString(message.createdDate);
      return message;
    });

    console.log("getCurrentUserCorrespondenceMessages", currentCorrespondence);

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
  addPost: async (args, req) => {
    const {
      title,
      imageUrl,
      categories,
      description,
      creatorId
    } = req.body.variables;

    // const currentUser = jwt.verify(
    //   req.body.variables.token,
    //   process.env.SECRET
    // );
    // const { _id } = currentUser;

    const newPost = await new Post({
      title,
      imageUrl,
      categories,
      description,
      createdBy: creatorId
    }).save();
    return newPost;
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
    console.log("posts", posts);
    const totalDocs = await Post.countDocuments();
    const hasMore = totalDocs > pageSize * pageNum;
    return { posts, hasMore };
  },
  infiniteScrollMessages: async (args, req) => {
    const { pageNum, pageSize, roomid } = req.body.variables;
    let chatRoom;
    let skip = pageSize * (pageNum - 1);
    if (pageNum === 1) {
      chatRoom = await ChatRoom.findOne({ _id: roomid }).populate({
        path: "messages",
        model: "ChatMessage",
        options: {
          limit: pageSize,
          sort: { createdDate: -1 }
        }
      });
    } else {
      // If page number is greater than one, figure out how many documents to skip
      chatRoom = await ChatRoom.findOne({ _id: roomid })
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
    }
    const totalDocs = await chatRoom.messages.length;

    console.log("totalDocs", totalDocs);
    const hasMore = totalDocs > pageSize * pageNum;
    const { messages } = chatRoom;
    console.log("messages", messages);
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
      // const currentChatRoom = await ChatRoom.findById(req.body.variables.roomId)
      await ChatRoom.findOneAndUpdate(
        { _id: req.body.variables.roomId },
        { $push: { messages: messageid } },
        { new: true }
      )
        .lean()
        .exec((err, data) => {
          if (err) {
            console.log("Something wrong when updating data!");
          }
        });

      if (req.body.variables.userid === undefined) {
        return false;
      }
      await inputMessage.save();
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
        participants: [
          req.body.variables.userid,
          req.body.variables.anotheruserid
        ]
      });

      // if querry don't find correspondence between two users
      if (data === null) {
        // create new correspondence
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
      console.log("PrivateMessageSent", err);
    }
  },
  addChatRoom: async (args, req) => {
    console.log("addChatRoom", req.body.variables);

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
      console.log("addChatRoom", err);
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
    const token = await { token: createToken(user, process.env.SECRET, "1hr") };
    // let token = null;
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
    return { token: createToken(newUser, process.env.SECRET, "1hr") };
  }
};

module.exports = rootResolver;
