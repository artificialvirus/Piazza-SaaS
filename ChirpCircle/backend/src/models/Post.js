// models/Post.js
const mongoose = require('mongoose');

const allowedTopics = ['politics', 'health', 'sport', 'tech'];

const PostSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      maxlength: 280,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true // Index on author for efficient author-based queries
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    topic: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: allowedTopics, // Strict enum validation
      index: true // Index on topic for efficient topic-based queries
    },
    expiration_time: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Live', 'Expired'],
      default: 'Live',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);

