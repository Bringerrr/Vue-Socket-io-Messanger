const User = require("../models/User");
const ChatMessage = require("../models/ChatMessage");

module.exports.setMessage = async (_, { text, name }, { User: User }) => {
  try {
    let _id = null;
    const userToSave = await User.findOne(
      { username: name },
      "_id",
      (err, res) => {
        if (err) {
          return undefined;
        }
      }
    );
    const inputMessage = await new ChatMessage({
      user: userToSave,
      message: text,
      deleted: false
    });
    _id = inputMessage._id;
    if (userToSave === undefined) {
      return false;
    }
    await inputMessage.save();
    return _id;
  } catch (err) {
    console.log("I am a tea spot: ", err);
  }
};

module.exports.editMessage = async (message, _id, index) => {
  try {
    const newMessage = await ChatMessage.findByIdAndUpdate(
      { _id: _id },
      { message: message },
      (err, res) => {
        if (err) {
          return undefined;
        } else {
          console.log("res: ", res);
        }
      }
    );
    if (newMessage === undefined) {
      return false;
    }
    await newMessage.save();
    return index;
  } catch (err) {
    return err;
  }
};

module.exports.resetMessage = async (_id, index) => {
  try {
    const messageToDelete = await ChatMessage.findByIdAndUpdate(
      { _id: _id },
      { deleted: true },
      (err, res) => {
        if (err) {
          console.log("err: ", err);
          return false;
        } else {
          console.log("res: ", res);
          return true;
        }
      }
    );
    if (messageToDelete === false) {
      return false;
    }
    await messageToDelete.save();
    return index;
  } catch (err) {
    return err;
  }
};

module.exports.getDBData = async (req, res) => {
  try {
    let messages,
      dataToSend = [];
    messages = await ChatMessage.find()
      .populate("user")
      .exec();
    messages.map(elem => {
      if (elem.deleted === false) {
        let newmess = {
          name: elem.user.username,
          text: elem.message,
          _id: elem._id
        };
        dataToSend.push(newmess);
      }
    });
    res.status(200).send({ dataToSend });
  } catch (err) {
    res.status(418).send({ message: "Tea spot reqiered" });
  }
};
