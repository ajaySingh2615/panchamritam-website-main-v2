const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');

// All cart routes require authentication
router.use(protect);

// Get user's cart
router.get('/', cartController.getCart);

// Add item to cart
router.post('/items', cartController.addToCart);

// Update cart item quantity
router.patch('/items/:cartItemId', cartController.updateCartItem);

// Remove item from cart
router.delete('/items/:cartItemId', cartController.removeFromCart);

// Clear cart
router.delete('/', cartController.clearCart);

// Validate cart inventory before checkout
router.post('/validate', cartController.validateCartInventory, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Inventory validation passed'
  });
});

module.exports = router; 