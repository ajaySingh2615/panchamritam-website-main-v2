const Cart = require('../models/cart');
const Product = require('../models/product');
const { AppError } = require('../middlewares/errorHandler');

// Get user's cart
exports.getCart = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const cart = await Cart.findByUserId(userId);
    
    res.status(200).json({
      status: 'success',
      data: {
        cart
      }
    });
  } catch (error) {
    next(error);
  }
};

// Add item to cart
exports.addToCart = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { productId, quantity = 1 } = req.body;
    
    // Validate input
    if (!productId) {
      return next(new AppError('Product ID is required', 400));
    }
    
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return next(new AppError('Quantity must be a positive number', 400));
    }
    
    // Check if product exists and has enough inventory
    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }
    
    if (product.quantity < parsedQuantity) {
      return next(new AppError(`Not enough inventory. Only ${product.quantity} items available`, 400));
    }
    
    // Add to cart
    const result = await Cart.addItem(userId, productId, parsedQuantity);
    
    res.status(200).json({
      status: 'success',
      message: 'Item added to cart',
      data: {
        cartItem: result
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    
    // Validate input
    if (!quantity && quantity !== 0) {
      return next(new AppError('Quantity is required', 400));
    }
    
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity)) {
      return next(new AppError('Quantity must be a number', 400));
    }
    
    // Update quantity
    const result = await Cart.updateItemQuantity(userId, cartItemId, parsedQuantity);
    
    res.status(200).json({
      status: 'success',
      message: result.removed ? 'Item removed from cart' : 'Cart updated',
      data: {
        cartItem: result
      }
    });
  } catch (error) {
    if (error.message === 'Cart item not found or does not belong to user') {
      return next(new AppError(error.message, 404));
    }
    next(error);
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { cartItemId } = req.params;
    
    const result = await Cart.removeItem(userId, cartItemId);
    
    res.status(200).json({
      status: 'success',
      message: 'Item removed from cart'
    });
  } catch (error) {
    if (error.message === 'Cart item not found or does not belong to user') {
      return next(new AppError(error.message, 404));
    }
    next(error);
  }
};

// Clear cart
exports.clearCart = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    
    await Cart.clearCart(userId);
    
    res.status(200).json({
      status: 'success',
      message: 'Cart cleared'
    });
  } catch (error) {
    next(error);
  }
}; 