// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const verifyJWT = require('../middlewares/verifyJWT');
const { getCurrentUser } = require('../controllers/userController');

// Protect routes with verifyJWT
router.use(verifyJWT);

// Fetch current user info
// GET /api/v1/users/me
router.get('/me', getCurrentUser);

// Add other user-related routes as needed
module.exports = router;

