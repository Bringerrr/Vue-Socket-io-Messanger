const mongoose = require("mongoose");

const correspondenceShema = new mongoose.Schema({
  participants: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    required: true
  },
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

module.exports = mongoose.model("Correspondence", correspondenceShema);
