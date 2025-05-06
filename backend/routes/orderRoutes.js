const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// All order routes require authentication
router.use(protect);

// Routes for all authenticated users
router.post('/checkout', orderController.checkout);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);

// Admin-only routes
router.get('/', restrictTo('admin'), orderController.getAllOrders);
router.patch('/:id/status', restrictTo('admin'), orderController.updateOrderStatus);

module.exports = router; 