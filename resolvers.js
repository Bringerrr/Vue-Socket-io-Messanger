const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

// const ChatMessage = require("./models/ChatMessage");

const createToken = (user, secret, expiresIn) => {
  const { username, email } = user;
  return jwt.sign({ username, email }, secret, { expiresIn });
};

module.exports = {
  Query: {
    getCurrentUser: async (_, args, { User, currentUser }) => {
      if (!currentUser) {
        return null;
      }
      const user = await User.findOne({
        username: currentUser.username
      });
      return user;
    },
    getPublicChatRooms: async (_, args, { ChatRoom }) => {
      const chatRooms = await ChatRoom.find({}).sort({ createdDate: "desc" });
      return chatRooms;
    },
    getPosts: async (_, args, { Post }) => {
      const posts = await Post.find({})
        .sort({ createdDate: "desc" })
        .populate({
          path: "createdBy",
          model: "User"
        });
      return posts;
    }
  },
  Mutation: {
    sendChatMessage: async (_, { message, userid }, { User }) => {
      console.log("SET MESSAGE", message, userid);
      try {
        const inputMessage = await new ChatMessage({
          userid,
          message,
          deleted: false
        });
        _id = inputMessage._id;
        if (userid === undefined) {
          return false;
        }
        await inputMessage.save();
        console.log(inputMessage);
        return inputMessage;
      } catch (err) {
        console.log("I am a tea spot: ", err);
      }
    },
    addPost: async (
      _,
      { title, imageUrl, categories, description, creatorId },
      { Post }
    ) => {
      const newPost = await new Post({
        title,
        imageUrl,
        categories,
        description,
        createdBy: creatorId
      }).save();
      return newPost;
    },
    addPublicChatRoom: async (
      _,
      { private, creatorId, title, description },
      { ChatRoom, User }
    ) => {
      const newPublicChatRoom = await new ChatRoom({
        participants: [creatorId],
        private,
        title,
        description,
        createdBy: creatorId
      }).save();
      const newPublicChatRoomId = newPublicChatRoom._id;
      const user = await User.findById(creatorId);
      if (!user) {
        throw new Error("User not found");
      }
      user.chatRooms.push(newPublicChatRoomId);
      user.save();
      return newPublicChatRoom;
    },
    signinUser: async (_, { username, password }, { User }) => {
      const user = await User.findOne({ username });
      if (!user) {
        throw new Error("User not found");
      }
      const isValidPassword = await bcryptjs.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error("Invalid password");
      }
      return { token: createToken(user, process.env.SECRET, "1hr") };
    },
    signupUser: async (_, { username, email, password }, { User }) => {
      const user = await User.findOne({ username });
      if (user) {
        throw new Error("User already exists");
      }
      const newUser = await new User({
        username,
        email,
        password
      }).save();
      return { token: createToken(newUser, process.env.SECRET, "1hr") };
    }
  }
};
