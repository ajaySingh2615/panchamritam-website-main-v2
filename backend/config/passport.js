const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const Role = require('../models/role');

// Configure Google strategy only if environment variables are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:5000/api/auth/google/callback',
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await User.findByGoogleId(profile.id);
          
          if (user) {
            // User exists with this Google ID, log them in
            return done(null, user);
          }
          
          // Check if user exists with this email
          user = await User.findByEmail(profile.emails[0].value);
          
          if (user) {
            // User exists with this email but not with Google ID
            // Update their account with Google ID
            const updatedUser = await User.updateGoogleInfo(user.user_id, {
              googleId: profile.id,
              googleEmail: profile.emails[0].value,
              profilePicture: profile.photos[0].value
            });
            return done(null, updatedUser);
          }
          
          // Get default role (user role)
          const userRole = await Role.findByName('user');
          if (!userRole) {
            return done(new Error('Default role not found'), null);
          }
          
          // Create new user
          const newUser = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            googleEmail: profile.emails[0].value,
            profilePicture: profile.photos[0].value,
            roleId: userRole.role_id
          });
          
          return done(null, newUser);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  console.log('Google OAuth credentials not found in environment. Google login disabled.');
}

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport; 