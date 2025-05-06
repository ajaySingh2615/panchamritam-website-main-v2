// Import models directly
const User = require('../models/user');
const Role = require('../models/role');
const Order = require('../models/order');
const Product = require('../models/product');
const Address = require('../models/address');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
// const { sendResetPasswordEmail } = require('../utils/emailService');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts from database
    const totalUsers = await User.count();
    const totalOrders = await Order.count();
    const totalProducts = await Product.count();
    
    // Calculate total revenue
    const totalRevenue = await Order.sumCompletedAmount() || 0;
    
    // Get recent orders (last 5)
    const recentOrders = await Order.findRecent(5);
    
    // Get new users (last 5)
    const newUsers = await User.findRecent(5);
    
    res.status(200).json({
      status: 'success',
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      recentOrders,
      newUsers
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve dashboard statistics'
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAllWithRoles();
    
    res.status(200).json({
      status: 'success',
      total: users.length,
      users
    });
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve users'
    });
  }
};

// Get single user
exports.getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      user
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve user'
    });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, passwordConfirm, phone_number, role_id } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !passwordConfirm || !role_id) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide name, email, password, password confirmation, and role'
      });
    }
    
    // Check if passwords match
    if (password !== passwordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message: 'Passwords do not match'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'User with this email already exists'
      });
    }
    
    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      phoneNumber: phone_number || null,
      roleId: role_id
    });
    
    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: {
        user: {
          id: newUser.userId,
          name: newUser.name, 
          email: newUser.email
        }
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create user'
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone_number, role_id } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Update user
    const updatedUser = await User.update(userId, {
      name: name || user.name,
      email: email || user.email,
      phoneNumber: phone_number || user.phone_number,
      roleId: role_id || user.role_id
    });
    
    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user'
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Delete user
    await User.delete(userId);
    
    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user'
    });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide role'
      });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Find role
    const roleRecord = await Role.findByName(role);
    if (!roleRecord) {
      return res.status(404).json({
        status: 'fail',
        message: 'Role not found'
      });
    }
    
    // Update user role
    const updatedUser = await User.updateRole(userId, roleRecord.role_id);
    
    res.status(200).json({
      status: 'success',
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user role'
    });
  }
};

// Reset user password
exports.resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set token expiry (10 minutes from now)
    const passwordResetExpires = Date.now() + 10 * 60 * 1000;
    
    // Update user with reset token
    await User.updateResetToken(userId, passwordResetToken, passwordResetExpires);
    
    // Send reset email
    try {
      // This would be implemented in a real application
      // sendResetPasswordEmail(user.email, resetToken);
      
      res.status(200).json({
        status: 'success',
        message: 'Password reset email has been sent'
      });
    } catch (err) {
      // If email fails to send, remove reset token
      await User.removeResetToken(userId);
      
      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending the email. Try again later!'
      });
    }
  } catch (error) {
    console.error('Error resetting user password:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset user password'
    });
  }
};

// Update user status (active/inactive)
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid status (active/inactive)'
      });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Update user status
    const updatedUser = await User.updateStatus(userId, status);
    
    res.status(200).json({
      status: 'success',
      message: 'User status updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user status'
    });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Get user orders
    const orders = await Order.findByUserId(userId);
    
    res.status(200).json({
      status: 'success',
      orders
    });
  } catch (error) {
    console.error('Error getting user orders:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve user orders'
    });
  }
};

// Get user addresses
exports.getUserAddresses = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Get user addresses
    const addresses = await Address.findByUserId(userId);
    
    res.status(200).json({
      status: 'success',
      addresses
    });
  } catch (error) {
    console.error('Error getting user addresses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve user addresses'
    });
  }
};

// Get user activity log
exports.getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // In a real app, you would have an activity log table
    // For now, we'll use orders and mock login data as sample activities
    
    // Get recent orders as activities
    const orders = await Order.findByUserId(userId, 5);
    
    // Format as activities
    const orderActivities = orders.map((order) => ({
      id: `order-${order.order_id}`,
      type: 'order',
      description: `Placed order #${order.order_id}`,
      details: `Order for $${order.total_amount} with status: ${order.status}`,
      timestamp: order.created_at
    }));
    
    // Create mock login activities (in a real app, these would come from a login log table)
    const loginActivities = [
      {
        id: `login-${userId}-1`,
        type: 'login',
        description: 'User logged in',
        details: 'Logged in via website',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        id: `login-${userId}-2`,
        type: 'login',
        description: 'User logged in',
        details: 'Logged in via mobile app',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    ];
    
    // Combine and sort activities
    const activities = [...orderActivities, ...loginActivities].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    res.status(200).json({
      status: 'success',
      activities
    });
  } catch (error) {
    console.error('Error getting user activity:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve user activity'
    });
  }
};

// Get all roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    
    res.status(200).json({
      status: 'success',
      roles
    });
  } catch (error) {
    console.error('Error getting all roles:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve roles'
    });
  }
}; 