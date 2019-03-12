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
  getCurrentUserPrivateMessages: async (args, req) => {
    const user = await User.findOne({
      username: req.body.variables.username
    })
      .populate({
        path: "correspondence",
        model: Correspondence
        // populate: { path: "participants", model: User }
      })
      .lean();
    console.log("user", user);
    return user;
  },
  getPublicChatRooms: async args => {
    const chatRooms = await ChatRoom.find({}).sort({ createdDate: "desc" });
    return chatRooms;
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
  getPosts: async args => {
    const posts = await Post.find({})
      .sort({ createdDate: "desc" })
      .populate({
        path: "createdBy",
        model: "User"
      });
    return posts;
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

      await Correspondence.findOne(
        {
          participants: [
            req.body.variables.userid,
            req.body.variables.anotheruserid
          ]
        },
        async (err, data) => {
          if (err) {
            console.log("CorrespondenceError", err);
          }
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
            User.find({
              _id: [req.body.variables.userid, req.body.variables.anotheruserid]
            }).exec((err, data) => {
              if (err) {
                console.log("userFoundError", err);
              }
              data.forEach(user => {
                user.correspondence.push(newCorrespondence._id);
                user.save();
                console.log(user);
              });
            });
          }
          if (data !== null) {
            data.messages.push(inputMessage._id);
            data.save(function(err) {
              if (err) {
                console.error("ERROR!");
              }
            });
          }
        }
      );
      await inputMessage.save();
      return inputMessage;
    } catch (err) {
      console.log("PrivateMessageSent", err);
    }
  },
  addPost: async (args, req) => {
    const newPost = await new Post({
      title: req.body.title,
      imageUrl: req.body.imageUrl,
      categories: req.body.categories,
      description: req.body.description,
      createdBy: req.body.creatorId
    }).save();
    return newPost;
  },
  addPublicChatRoom: async (args, req) => {
    console.log("addPublicChatRoom", req.body.variables);

    try {
      const newPublicChatRoom = await new ChatRoom({
        participants: [req.body.variables.userid],
        private: true,
        title: req.body.variables.title,
        description: req.body.variables.description,
        createdBy: req.body.variables.userid
      }).save();
      const newPublicChatRoomId = newPublicChatRoom._id;
      const user = await User.findById(req.body.variables.userid);
      if (!user) {
        throw new Error("User not found");
      }
      user.chatRooms.push(newPublicChatRoomId);
      user.save();
      return newPublicChatRoom;
    } catch (err) {
      console.log("addPublicChatRoom", err);
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
