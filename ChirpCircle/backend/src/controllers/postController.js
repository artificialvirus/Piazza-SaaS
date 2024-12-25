// controllers/postController.js
const Post = require('../models/Post');

exports.createPost = async (req, res, next) => {
  try {
    const { content, topic, expiration_time } = req.body;

    const normalizedTopic = topic.trim().toLowerCase();

    const post = new Post({
      content,
      topic: normalizedTopic,
      author: req.userId,
      expiration_time: new Date(expiration_time),
    });

    await post.save();
    res.status(201).json({
      success: true,
      data: post,
      message: 'Post created successfully.'
    });

  } catch (err) {
    next(err);
  }
};

exports.getPosts = async (req, res, next) => {
  try {
    const {
      topic,
      status = 'Live',
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};
    if (topic) {
      filter.topic = topic.toString().trim().toLowerCase();
    }
    filter.status = status;

    const sortOrder = order === 'asc' ? 1 : -1;
    const pageNumber = Number(page);
    const pageLimit = Number(limit);

    const totalItems = await Post.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageLimit);

    const posts = await Post.find(filter)
      .populate('author', 'username')
      .sort({ [sortBy]: sortOrder })
      .skip((pageNumber - 1) * pageLimit)
      .limit(pageLimit);

    res.json({
      success: true,
      data: posts,
      message: 'Posts retrieved successfully.',
      meta: {
        totalItems,
        totalPages,
        currentPage: pageNumber,
        limit: pageLimit
      }
    });

  } catch (err) {
    next(err);
  }
};

exports.likePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post || post.status !== 'Live') {
      return res.status(400).json({
        success: false,
        message: 'Cannot like an expired post.'
      });
    }

    if (post.author.toString() === req.userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot like your own post.'
      });
    }

    if (post.likes.includes(req.userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have already liked this post.'
      });
    }

    post.likes.push(req.userId);
    await post.save();

    res.json({
      success: true,
      data: post,
      message: 'Post liked successfully.'
    });

  } catch (err) {
    next(err);
  }
};

exports.dislikePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    
    if (!post || post.status !== 'Live') {
      return res.status(400).json({
        success: false,
        message: 'Cannot dislike an expired post.'
      });
    }

    if (post.author.toString() === req.userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot dislike your own post.'
      });
    }

    if (post.dislikes.includes(req.userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have already disliked this post.'
      });
    }

    // If user has liked the post, remove that like when they choose to dislike
    const likeIndex = post.likes.indexOf(req.userId);
    if (likeIndex !== -1) {
      post.likes.splice(likeIndex, 1);
    }

    post.dislikes.push(req.userId);
    await post.save();

    res.json({
      success: true,
      data: post,
      message: 'Post disliked successfully.'
    });

  } catch (err) {
    next(err);
  }
};

exports.getMostActivePosts = async (req, res, next) => {
  try {
    const { topic } = req.query;

    const filter = { status: 'Live' };
    if (topic) {
      filter.topic = topic.toString().trim().toLowerCase();
    }

    const posts = await Post.aggregate([
      { $match: filter },
      {
        $addFields: {
          engagementScore: { $add: [{ $size: '$likes' }, { $size: '$dislikes' }] },
        },
      },
      { $sort: { engagementScore: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: posts,
      message: 'Most active posts retrieved successfully.'
    });
    
  } catch (err) {
    next(err);
  }
};

