// models/Comment.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      maxlength: 280,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true // Indexing author for comment queries by author if needed
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true // Indexing post for efficient post-comments queries
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Comment', CommentSchema);

