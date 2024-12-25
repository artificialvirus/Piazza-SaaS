// controllers/authController.js
const RefreshToken = require('../models/RefreshToken');

exports.logout = async (req, res) => {
  // We have userId from verifyJWT if we protect this route,
  // or require refresh token in request body to identify user.
  // If the route is protected, we have req.userId.
  // If not protected, ask client to provide refreshToken to identify which to invalidate.

  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required to logout.' });
  }

  // Delete the refresh token from DB
  await RefreshToken.deleteOne({ token: refreshToken });
  // (Just optional) delete all refresh tokens for that user to fully log them out:
  // await RefreshToken.deleteMany({ user: req.userId });

  res.json({ message: 'Logout successful. Refresh token invalidated.' });
};

