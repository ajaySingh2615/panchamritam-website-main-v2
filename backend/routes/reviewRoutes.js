const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Public routes - Anyone can view product reviews
router.get('/product/:productId', reviewController.getProductReviews);

// Protected routes - Only authenticated users can submit reviews
router.use(protect); // All routes below require authentication

// User review management
router.get('/my-reviews', reviewController.getUserReviews);
router.post('/product/:productId', reviewController.createReview);
router.put('/:reviewId', reviewController.updateReview);
router.delete('/:reviewId', reviewController.deleteReview);

module.exports = router; 