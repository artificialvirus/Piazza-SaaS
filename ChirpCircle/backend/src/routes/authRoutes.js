// routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const verifyJWT = require('../middlewares/verifyJWT');
const router = express.Router();
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokens');
const RefreshToken = require('../models/RefreshToken');
const rateLimit = require('express-rate-limit');

// Rate limit for auth routes to prevent abuse
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});
router.use(authLimiter);

// Initial OAuth login route
router.get('/oauth/login', passport.authenticate('oauth2', { scope: ['openid', 'profile', 'email'], session: false }));

// OAuth callback route
router.get('/oauth/callback', 
  passport.authenticate('oauth2', { failureRedirect: '/login', session: false }), 
  async (req, res) => {
    // Generate tokens
    const accessToken = generateAccessToken(req.user.id);
    const refreshToken = await generateRefreshToken(req.user.id);

    // Return both tokens
    res.json({ success: true, data: { accessToken, refreshToken } });
  }
);

// Refresh endpoint for access token
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token is required.' });
  }

  const storedToken = await RefreshToken.findOne({ token: refreshToken });
  if (!storedToken || storedToken.expiresAt < new Date()) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }

  // Generate a new access token
  const accessToken = generateAccessToken(storedToken.user.toString());

  // Not necessary at the moment (just for extra security)
  // Rotate the refresh token to enhance security (invalidate old one, issue new one)
  // await RefreshToken.deleteOne({ token: refreshToken });
  // const newRefreshToken = await generateRefreshToken(storedToken.user.toString());
  // return res.json({ accessToken, refreshToken: newRefreshToken });

  res.json({ success: true, data: { accessToken }, message: 'Access token refreshed successfully.' });
});

// Test-only login route (remove in production)
router.post('/local-test-login', async (req, res) => {
  const { username } = req.body;
  const normalizedUsername = username.toLowerCase();

  let user = await User.findOne({ username: normalizedUsername });
  if (!user) {
    user = new User({
      oauthId: `mock-${normalizedUsername}`,
      username: normalizedUsername,
      email: `${normalizedUsername}@example.com`
    });
    await user.save();
  }

  const accessToken = generateAccessToken(user._id.toString());
  const newRefreshToken = await generateRefreshToken(user._id.toString());

  res.json({ success: true, data: { accessToken, refreshToken: newRefreshToken }, message: 'Test user logged in.' });
});

// Check if authenticated (JWT protected)
router.get('/is-authenticated', verifyJWT, (req, res) => {
  res.json({ success: true, data: { user: req.userId }, message: 'User is authenticated.' });
});

// Logout route (invalidate refresh token)
router.post('/logout', verifyJWT, require('../controllers/authController').logout);

module.exports = router;

