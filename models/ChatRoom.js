const mongoose = require("mongoose");

const chatShema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  private: {
    type: Boolean,
    required: true
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  ],
  createdDate: {
    type: Date,
    default: Date.now
  },
  messages: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: "ChatMessage"
  }
});

module.exports = mongoose.model("ChatRoom", chatShema);
