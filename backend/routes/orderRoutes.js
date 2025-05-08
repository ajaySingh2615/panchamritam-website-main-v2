const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const cartController = require('../controllers/cartController');
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

// Create a new order (with tax calculation and inventory validation)
router.post('/', cartController.validateCartInventory, orderController.createOrderWithTax);

// Cancel order
router.patch('/:orderId/cancel', orderController.cancelOrder);

// Get invoice for order
router.get('/:id/invoice', orderController.generateInvoice);

// Get invoice PDF for download
router.get('/:id/invoice/pdf', orderController.generateInvoicePDF);

// Email invoice
router.post('/:id/invoice/email', orderController.emailInvoice);

module.exports = router; 