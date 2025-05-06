const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const jwt = require('jsonwebtoken');

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=Authentication failed`,
    session: false 
  }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { id: req.user.user_id, role: req.user.role_name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      // Redirect to frontend with token and success message
      res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}&success=true`);
    } catch (error) {
      console.error('Error in Google callback:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication failed`);
    }
  }
);

// Phone authentication routes
router.post('/phone/verify', authController.verifyFirebaseToken);

// Protected routes
router.get('/me', protect, authController.getCurrentUser);

// Admin-only routes
router.post('/admin', protect, restrictTo('admin'), authController.createAdmin);

module.exports = router; 