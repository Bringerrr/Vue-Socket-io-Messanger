const mongoose = require("mongoose");

const chatShema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  username: {
    type: String,
    required: false
  },
  message: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    require: false
  },
  deleted: {
    type: Boolean,
    required: false
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ChatMessage", chatShema);
