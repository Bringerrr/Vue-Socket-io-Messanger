const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: {
    text: true,
    type: String,
    required: true
  },
  imageUrl: {
    text: true,
    type: String,
    required: true
  },
  categories: {
    text: true,
    type: [String],
    required: true
  },
  description: {
    text: true,
    type: String,
    required: true
  },
  createdDate: {
    text: true,
    type: Date,
    default: Date.now
  },
  likes: {
    text: true,
    type: Number,
    default: 0
  },
  createdBy: {
    text: true,
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  messages: [
    {
      messageBody: {
        text: true,
        type: String,
        required: true
      },
      messageDate: {
        text: true,
        type: Date,
        default: Date.now
      },
      messageUser: {
        text: true,
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
      }
    }
  ]
});

// Create index to search on all fields of posts
PostSchema.indexes({
  "$**": "text"
});

module.exports = mongoose.model("Post", PostSchema);
