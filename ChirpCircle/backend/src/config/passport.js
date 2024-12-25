// config/passport.js
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;
const User = require('../models/User');
const axios = require('axios');

// Configure OAuth2Strategy for Google
passport.use(
  new OAuth2Strategy(
    {
      authorizationURL: process.env.AUTHORIZATION_URL,
      tokenURL: process.env.TOKEN_URL,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL || 'http://35-193-193-53.nip.io/api/v1/auth/oauth/callback',
    },
    async (accessToken, refreshToken, params, profile, done) => {
      try {
        // Retrieve user profile using access token from Google
        const response = await axios.get(process.env.USER_INFO_URL, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const profileData = response.data;

        // Log the entire profileData to understand its structure
        console.log('Google profileData:', profileData);

        // Fallback logic:
        // If name is missing, fall back to sub (the user's unique ID from Google)
        // If email is missing, create a placeholder email.
        const username = profileData.name || `User-${profileData.sub}`;
        const email = profileData.email || `${profileData.sub}@noemail.com`;

        // Find or create user
        let user = await User.findOne({ oauthId: profileData.sub });
        if (!user) {
          user = new User({
            oauthId: profileData.sub,
            username: username,
            email: email,
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

console.log('OAuth2Strategy has been configured.');

module.exports = passport;

