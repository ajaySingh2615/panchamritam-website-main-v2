const Order = require('../models/order');
const Address = require('../models/address');
const { AppError } = require('../middlewares/errorHandler');

// Create new order from cart (checkout)
exports.checkout = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { addressId, paymentMethod = 'Cash on Delivery' } = req.body;
    
    // Validate input
    if (!addressId) {
      return next(new AppError('Address ID is required', 400));
    }
    
    // Check if address exists and belongs to user
    const address = await Address.findById(addressId);
    
    if (!address) {
      return next(new AppError('Address not found', 404));
    }
    
    if (address.user_id !== userId) {
      return next(new AppError('This address does not belong to you', 403));
    }
    
    // Create order from cart
    try {
      const order = await Order.createFromCart(userId, addressId, paymentMethod);
      
      res.status(201).json({
        status: 'success',
        message: 'Order placed successfully',
        data: {
          order
        }
      });
    } catch (error) {
      if (error.message === 'Cart is empty') {
        return next(new AppError('Your cart is empty', 400));
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
    const orders = await Order.findAll(limit, offset);
    
    res.status(200).json({
      status: 'success',
      results: orders.length,
      pagination: {
        page,
        limit,
        hasMore: orders.length === limit
      },
      data: {
        orders
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get order by ID
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return next(new AppError('Order not found', 404));
    }
    
    // Regular users can only view their own orders
    if (order.user_id !== userId && req.user.role_name !== 'admin') {
      return next(new AppError('You do not have permission to view this order', 403));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders for the current user
exports.getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
    const orders = await Order.findByUserId(userId, limit, offset);
    
    res.status(200).json({
      status: 'success',
      results: orders.length,
      pagination: {
        page,
        limit,
        hasMore: orders.length === limit
      },
      data: {
        orders
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return next(new AppError('Status is required', 400));
    }
    
    try {
      const result = await Order.updateStatus(id, status);
      
      if (!result) {
        return next(new AppError('Order not found', 404));
      }
      
      res.status(200).json({
        status: 'success',
        message: `Order status updated to '${status}'`,
        data: {
          order: result
        }
      });
    } catch (error) {
      if (error.message.includes('Invalid status')) {
        return next(new AppError(error.message, 400));
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
}; 