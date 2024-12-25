// controllers/userController.js
const User = require('../models/User');

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'User retrieved successfully.'
    });
    
  } catch (err) {
    next(err);
  }
};

