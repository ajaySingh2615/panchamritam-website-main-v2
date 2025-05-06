const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const wishlistController = require('../controllers/wishlistController');

// All wishlist routes require authentication
router.use(protect);

// Get all wishlist items
router.get('/', wishlistController.getWishlist);

// Add product to wishlist
router.post('/', wishlistController.addToWishlist);

// Remove product from wishlist
router.delete('/:productId', wishlistController.removeFromWishlist);

// Check if product is in wishlist
router.get('/:productId', wishlistController.checkWishlistItem);

// Clear entire wishlist
router.delete('/', wishlistController.clearWishlist);

module.exports = router; 