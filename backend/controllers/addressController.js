const Address = require('../models/address');
const { AppError } = require('../middlewares/errorHandler');
const { pool } = require('../config/db');

// Get all addresses for the current user
exports.getMyAddresses = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    
    const addresses = await Address.findByUserId(userId);
    
    res.status(200).json({
      status: 'success',
      results: addresses.length,
      data: {
        addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get default address for the current user
exports.getMyDefaultAddress = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    
    const address = await Address.findDefaultByUserId(userId);
    
    if (!address) {
      return next(new AppError('No default address found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        address
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get address by ID (verify it belongs to the user)
exports.getAddressById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    
    const address = await Address.findById(id);
    
    if (!address) {
      return next(new AppError('Address not found', 404));
    }
    
    // Verify ownership
    if (address.user_id !== userId && req.user.role_name !== 'admin') {
      return next(new AppError('You do not have permission to access this address', 403));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        address
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new address
exports.createAddress = async (req, res, next) => {
  try {
    const { 
      name, 
      addressLine, 
      city, 
      state, 
      zipCode, 
      country, 
      phoneNumber,
      addressType,
      isDefault 
    } = req.body;
    
    const userId = req.user.user_id;
    
    // Validate input
    if (!name || !addressLine || !city || !state || !zipCode || !country || !phoneNumber) {
      return next(new AppError('Please provide all required address fields', 400));
    }
    
    const newAddress = await Address.create({
      userId,
      name,
      addressLine,
      city,
      state,
      zipCode,
      country,
      phoneNumber,
      addressType: addressType || 'Home',
      isDefault: isDefault || false
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        address: newAddress
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update address
exports.updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      addressLine, 
      city, 
      state, 
      zipCode, 
      country, 
      phoneNumber,
      addressType,
      isDefault 
    } = req.body;
    
    const userId = req.user.user_id;
    
    // Validate input
    if (!name || !addressLine || !city || !state || !zipCode || !country || !phoneNumber) {
      return next(new AppError('Please provide all required address fields', 400));
    }
    
    // Check if address exists and belongs to user
    const existingAddress = await Address.findById(id);
    
    if (!existingAddress) {
      return next(new AppError('Address not found', 404));
    }
    
    // Verify ownership
    if (existingAddress.user_id !== userId && req.user.role_name !== 'admin') {
      return next(new AppError('You do not have permission to update this address', 403));
    }
    
    const updatedAddress = await Address.update(id, {
      userId,
      name,
      addressLine,
      city,
      state,
      zipCode,
      country,
      phoneNumber,
      addressType: addressType || existingAddress.address_type,
      isDefault: isDefault !== undefined ? isDefault : existingAddress.is_default
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        address: updatedAddress
      }
    });
  } catch (error) {
    next(error);
  }
};

// Set address as default
exports.setDefaultAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    
    // Check if address exists and belongs to user
    const existingAddress = await Address.findById(id);
    
    if (!existingAddress) {
      return next(new AppError('Address not found', 404));
    }
    
    // Verify ownership
    if (existingAddress.user_id !== userId && req.user.role_name !== 'admin') {
      return next(new AppError('You do not have permission to update this address', 403));
    }
    
    // Clear previous default address
    await pool.execute(
      'UPDATE Addresses SET is_default = false WHERE user_id = ?',
      [userId]
    );
    
    // Set new default address
    await pool.execute(
      'UPDATE Addresses SET is_default = true WHERE address_id = ?',
      [id]
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Default address updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete address
exports.deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    
    // Check if address exists and belongs to user
    const existingAddress = await Address.findById(id);
    
    if (!existingAddress) {
      return next(new AppError('Address not found', 404));
    }
    
    // Verify ownership
    if (existingAddress.user_id !== userId && req.user.role_name !== 'admin') {
      return next(new AppError('You do not have permission to delete this address', 403));
    }
    
    try {
      const deleted = await Address.delete(id);
      
      res.status(200).json({
        status: 'success',
        message: 'Address deleted successfully'
      });
    } catch (error) {
      if (error.message === 'Cannot delete address that is used in orders') {
        return next(new AppError(error.message, 400));
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
}; 