const Cart = require('../models/cart');
const Product = require('../models/product');
const { AppError } = require('../middlewares/errorHandler');
const { pool } = require('../config/db');

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
    
    // Get current cart to check if product already exists in cart
    const currentCart = await Cart.findByUserId(userId);
    const cartItem = currentCart.items.find(item => 
      parseInt(item.product_id) === parseInt(productId)
    );
    const currentQuantity = cartItem ? cartItem.quantity : 0;
    
    // Calculate total requested quantity (current + new)
    const totalRequestedQuantity = currentQuantity + parsedQuantity;
    
    // Check if product has enough inventory
    const inventoryCheck = await Product.checkInventory(productId, totalRequestedQuantity);
    
    if (!inventoryCheck.sufficient) {
      return next(new AppError(
        `Insufficient inventory. Only ${inventoryCheck.available} items available, and you already have ${currentQuantity} in your cart.`, 
        400
      ));
    }
    
    // Add to cart if inventory check passes
    const result = await Cart.addItem(userId, productId, parsedQuantity);
    
    res.status(200).json({
      status: 'success',
      message: 'Item added to cart',
      data: {
        cartItem: result,
        availableStock: inventoryCheck.available - totalRequestedQuantity
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
    
    // If quantity is 0 or negative, remove item
    if (parsedQuantity <= 0) {
      await Cart.removeItem(userId, cartItemId);
      return res.status(200).json({
        status: 'success',
        message: 'Item removed from cart',
        data: { removed: true }
      });
    }
    
    // Get the cart item details
    const cartItem = await Cart.findCartItemById(cartItemId);
    if (!cartItem) {
      return next(new AppError('Cart item not found', 404));
    }
    
    // Verify cart belongs to user
    const [carts] = await pool.execute(
      'SELECT c.* FROM Cart c JOIN Cart_Items ci ON c.cart_id = ci.cart_id WHERE ci.cart_item_id = ? AND c.user_id = ?',
      [cartItemId, userId]
    );
    
    if (carts.length === 0) {
      return next(new AppError('Cart item not found or does not belong to user', 404));
    }
    
    // Check if product has enough inventory
    const productId = cartItem.product_id;
    const inventoryCheck = await Product.checkInventory(productId, parsedQuantity);
    
    if (!inventoryCheck.sufficient) {
      return next(new AppError(inventoryCheck.message, 400));
    }
    
    // Update quantity
    const result = await Cart.updateItemQuantity(userId, cartItemId, parsedQuantity);
    
    res.status(200).json({
      status: 'success',
      message: 'Cart updated',
      data: {
        cartItem: result,
        availableStock: inventoryCheck.available - parsedQuantity
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

// Validate inventory before checkout
exports.validateCartInventory = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    
    // Get user's cart
    const cart = await Cart.findByUserId(userId);
    
    // If cart is empty, return error
    if (!cart.items.length) {
      return next(new AppError('Cart is empty', 400));
    }
    
    // Validate each item against inventory
    const inventoryIssues = [];
    
    for (const item of cart.items) {
      const inventoryCheck = await Product.checkInventory(
        item.product_id, 
        item.quantity
      );
      
      if (!inventoryCheck.exists) {
        inventoryIssues.push({
          product_id: item.product_id,
          name: item.name,
          error: 'Product no longer exists'
        });
        continue;
      }
      
      if (!inventoryCheck.sufficient) {
        inventoryIssues.push({
          product_id: item.product_id,
          name: item.name,
          requested: item.quantity,
          available: inventoryCheck.available,
          error: inventoryCheck.message
        });
      }
    }
    
    if (inventoryIssues.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Inventory issues detected',
        data: { inventoryIssues }
      });
    }
    
    // All inventory checks passed, proceed
    next();
  } catch (error) {
    next(error);
  }
}; 