// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    oauthId: { type: String, unique: true, index: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 30,
      index: true // Index for efficient username lookups
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 100,
      index: true // Index for efficient email lookups
    },
    password: {
      type: String,
      minlength: 6,
    },
    bio: {
      type: String,
      maxlength: 160,
    },
    avatar: {
      type: String,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Hash password before saving to database
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Password comparison method
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for follower count
UserSchema.virtual('followersCount').get(function () {
  return this.followers ? this.followers.length : 0;
});

// Virtual for following count
UserSchema.virtual('followingCount').get(function () {
  return this.following ? this.following.length : 0;
});

module.exports = mongoose.model('User', UserSchema);

