const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Protected route example - user dashboard
router.get('/dashboard', protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to your dashboard!',
    data: {
      user: req.user
    }
  });
});

// Admin-only route example
router.get('/admin', protect, restrictTo('admin'), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Admin access granted',
    data: {
      user: req.user
    }
  });
});

module.exports = router; 