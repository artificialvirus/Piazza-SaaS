// controllers/commentController.js
const Comment = require('../models/Comment');
const Post = require('../models/Post');

exports.addComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    // Find the post
    const post = await Post.findById(postId);
    if (!post || post.status !== 'Live') {
      return res.status(400).json({
        success: false,
        message: 'Cannot comment on an expired or non-existent post.'
      });
    }

    // Create a new comment
    const comment = new Comment({
      text,
      author: req.userId,
      post: postId,
    });

    await comment.save();

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment added successfully.'
    });

  } catch (err) {
    next(err);
  }
};

exports.getCommentsByPost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: comments,
      message: 'Comments retrieved successfully.'
    });
    
  } catch (err) {
    next(err);
  }
};

