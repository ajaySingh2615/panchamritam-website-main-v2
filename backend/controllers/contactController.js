const ContactMessage = require('../models/contactMessage');
const { AppError } = require('../middlewares/errorHandler');

// Submit contact form (public)
exports.submitContactForm = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validation
    if (!name || !email || !message) {
      return next(new AppError('Name, email, and message are required', 400));
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new AppError('Please provide a valid email address', 400));
    }
    
    // Create contact message
    const newMessage = await ContactMessage.create({
      name,
      email,
      subject: subject || 'Contact Form Submission',
      message
    });
    
    res.status(201).json({
      status: 'success',
      message: 'Your message has been sent successfully',
      data: {
        id: newMessage.messageId
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all contact messages (admin only)
exports.getAllMessages = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
    const messages = await ContactMessage.findAll(limit, offset);
    
    res.status(200).json({
      status: 'success',
      results: messages.length,
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit
      },
      data: {
        messages
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get contact message by ID (admin only)
exports.getMessageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const message = await ContactMessage.findById(id);
    
    if (!message) {
      return next(new AppError('Message not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        message
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete contact message (admin only)
exports.deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await ContactMessage.delete(id);
    
    if (!deleted) {
      return next(new AppError('Message not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Message deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}; 