// middlewares/checkPostLive.js
const Post = require('../models/Post');

exports.checkPostLive = async (req, res, next) => {
  const postId = req.params.postId;
  const post = await Post.findById(postId);

  if (!post || post.status !== 'Live') {
    return res.status(400).json({
      success: false,
      message: 'This post is expired and cannot be interacted with.',
    });
  }

  next();
};

