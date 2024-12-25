// utils/tokens.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' }); // 15 minutes
};

exports.generateRefreshToken = async (userId) => {
  // Generate a random string as a refresh token
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const RefreshToken = require('../models/RefreshToken');
  await RefreshToken.create({ user: userId, token, expiresAt });

  return token;
};

