const Wishlist = require('../models/wishlist');
const { AppError } = require('../middlewares/errorHandler');

// Get all items in the user's wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    
    const wishlistItems = await Wishlist.findByUserId(userId);
    
    res.status(200).json({
      status: 'success',
      count: wishlistItems.length,
      data: wishlistItems
    });
  } catch (error) {
    next(error);
  }
};

// Add an item to the wishlist
exports.addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { productId } = req.body;
    
    if (!productId) {
      return next(new AppError('Product ID is required', 400));
    }
    
    const result = await Wishlist.addItem(userId, productId);
    
    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Remove an item from the wishlist
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { productId } = req.params;
    
    if (!productId) {
      return next(new AppError('Product ID is required', 400));
    }
    
    const result = await Wishlist.removeItem(userId, productId);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Check if an item is in the wishlist
exports.checkWishlistItem = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { productId } = req.params;
    
    if (!productId) {
      return next(new AppError('Product ID is required', 400));
    }
    
    const item = await Wishlist.findItem(userId, productId);
    
    res.status(200).json({
      status: 'success',
      inWishlist: !!item,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// Clear all items from the wishlist
exports.clearWishlist = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    
    const result = await Wishlist.clearWishlist(userId);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
}; 