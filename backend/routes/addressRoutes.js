const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const addressController = require('../controllers/addressController');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get all user addresses and create new address
router
  .route('/')
  .get(addressController.getMyAddresses)
  .post(addressController.createAddress);

// Get default address
router
  .route('/default')
  .get(addressController.getMyDefaultAddress);

// Get, update and delete specific address
router
  .route('/:id')
  .get(addressController.getAddressById)
  .patch(addressController.updateAddress)
  .delete(addressController.deleteAddress);

// Set an address as default
router
  .route('/:id/default')
  .patch(addressController.setDefaultAddress);

module.exports = router; 