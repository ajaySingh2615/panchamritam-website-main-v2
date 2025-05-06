const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const adminController = require('../controllers/adminController');

// All routes are protected and restricted to admin role

// Dashboard stats
router.get('/dashboard', protect, restrictTo('admin'), adminController.getDashboardStats);

// User management
router.get('/users', protect, restrictTo('admin'), adminController.getAllUsers);
router.get('/users/:userId', protect, restrictTo('admin'), adminController.getUser);
router.post('/users', protect, restrictTo('admin'), adminController.createUser);
router.put('/users/:userId', protect, restrictTo('admin'), adminController.updateUser);
router.delete('/users/:userId', protect, restrictTo('admin'), adminController.deleteUser);
router.put('/users/:userId/role', protect, restrictTo('admin'), adminController.updateUserRole);
router.post('/users/:userId/reset-password', protect, restrictTo('admin'), adminController.resetUserPassword);
router.put('/users/:userId/status', protect, restrictTo('admin'), adminController.updateUserStatus);

// User related data
router.get('/users/:userId/orders', protect, restrictTo('admin'), adminController.getUserOrders);
router.get('/users/:userId/addresses', protect, restrictTo('admin'), adminController.getUserAddresses);
router.get('/users/:userId/activity', protect, restrictTo('admin'), adminController.getUserActivity);

// Roles
router.get('/roles', protect, restrictTo('admin'), adminController.getAllRoles);

module.exports = router; 