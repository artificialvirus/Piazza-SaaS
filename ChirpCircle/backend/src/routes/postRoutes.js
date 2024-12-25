// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validators');
const verifyJWT = require('../middlewares/verifyJWT');
const { checkPostLive } = require('../middlewares/checkPostLive');
const {
  createPost,
  getPosts,
  likePost,
  getMostActivePosts,
  dislikePost,
} = require('../controllers/postController');
const { addComment } = require('../controllers/commentController');
const Comment = require('../models/Comment'); // Import Comment model

// Protect routes
router.use(verifyJWT);


// @route   POST /api/posts
router.post(
  '/',
  validate([
    body('content')
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ max: 280 })
      .withMessage('Content cannot exceed 280 characters'),
    body('topic')
      .notEmpty()
      .withMessage('Topic is required')
      .isLength({ min: 2, max: 30 })
      .withMessage('Topic must be between 2 and 30 characters')
      .matches(/^[a-zA-Z0-9 ]+$/)
      .withMessage('Topic can only contain letters, numbers, and spaces'),
    body('expiration_time')
      .notEmpty()
      .withMessage('Expiration time is required')
      .isISO8601()
      .withMessage('Expiration time must be a valid date'),
  ]),
  createPost,
);

// @route   GET /api/posts/:postId/comments
router.get('/:postId/comments', async (req, res, next) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: comments, message: 'Comments retrieved successfully.' });
  } catch (err) {
    next(err);
  }
});

// Retrieve paginated posts with optional sorting/filtering
// For "most active" posts, clients can call: GET /api/v1/posts?sort=engagementScore
router.get('/', getPosts);

// @route   POST /api/v1/posts/:postId/like
router.post('/:postId/like', checkPostLive, likePost);

// @route   POST /api/v1/posts/:postId/dislike
router.post('/:postId/dislike', checkPostLive, dislikePost);

// @route   POST /api/v1/posts/:postId/comments
router.post(
  '/:postId/comments',
  checkPostLive,
  validate([
    body('text')
      .notEmpty()
      .withMessage('Comment text is required')
      .isLength({ max: 280 })
      .withMessage('Comment cannot exceed 280 characters'),
  ]),
  addComment,
);

// @route   GET /api/v1/posts/most-active
router.get('/most-active', getMostActivePosts);

module.exports = router;

