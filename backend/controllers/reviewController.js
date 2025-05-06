const Review = require('../models/review');
const Product = require('../models/product');
const { AppError } = require('../middlewares/errorHandler');
const { pool } = require('../config/db');

// Get reviews for a product
exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }
    
    // Get all reviews without status filtering
    const reviews = await Review.findByProductId(productId, limit, offset);
    
    // Get review statistics
    const stats = await Review.getProductStats(productId);
    
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get reviews by a user (for user profile)
exports.getUserReviews = async (req, res, next) => {
  try {
    const userId = req.user.user_id; // From auth middleware
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
    const reviews = await Review.findByUserId(userId, limit, offset);
    
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create a new review
exports.createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.user_id; // From auth middleware
    const { rating, title, content } = req.body;
    
    console.log('Review submission request:', {
      productId,
      userId,
      rating: parseFloat(rating),
      title,
      content,
      userObj: req.user,
      body: req.body
    });
    
    // Validate required fields
    if (!rating || isNaN(parseFloat(rating)) || parseFloat(rating) < 1 || parseFloat(rating) > 5) {
      return next(new AppError('Rating must be between 1 and 5', 400));
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }
    
    // Check if user has already reviewed this product
    const existingReview = await Review.checkUserReview(userId, productId);
    if (existingReview) {
      return next(new AppError('You have already reviewed this product', 400));
    }
    
    // Create review
    try {
      const newReview = await Review.create({
        productId: parseInt(productId, 10),
        userId: parseInt(userId, 10),
        rating: parseFloat(rating),
        title: title || 'Review',
        content: content || ''
      });
      
      // Get user information for the response
      const user = req.user;
      
      // Enhance the review object with user information
      const enhancedReview = {
        ...newReview,
        user_name: user.name,
        avatar_url: user.profile_picture
      };
      
      res.status(201).json({
        status: 'success',
        data: {
          review: enhancedReview
        }
      });
    } catch (createError) {
      console.error('Error in review creation:', createError);
      return next(new AppError(`Failed to create review: ${createError.message}`, 500));
    }
  } catch (error) {
    console.error('Error creating review:', error);
    next(error);
  }
};

// Update a review
exports.updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.user_id; // From auth middleware
    const { rating, title, content } = req.body;
    
    // Validate required fields
    if (rating && (rating < 1 || rating > 5)) {
      return next(new AppError('Rating must be between 1 and 5', 400));
    }
    
    // Check if review exists
    const review = await Review.findById(reviewId);
    if (!review) {
      return next(new AppError('Review not found', 404));
    }
    
    // Check if user owns the review
    if (review.user_id !== userId && req.user.role !== 'admin') {
      return next(new AppError('You are not authorized to update this review', 403));
    }
    
    // Update review
    const success = await Review.update(reviewId, {
      rating: rating || review.rating,
      title: title || review.title,
      content: content || review.content
    });
    
    if (!success) {
      return next(new AppError('Failed to update review', 500));
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Review updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete a review
exports.deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.user_id; // From auth middleware
    
    // Check if review exists
    const review = await Review.findById(reviewId);
    if (!review) {
      return next(new AppError('Review not found', 404));
    }
    
    // Check if user owns the review or is admin
    if (review.user_id !== userId && req.user.role !== 'admin') {
      return next(new AppError('You are not authorized to delete this review', 403));
    }
    
    // Delete review
    const success = await Review.delete(reviewId);
    
    if (!success) {
      return next(new AppError('Failed to delete review', 500));
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Admin functions to manage reviews

// Get all pending reviews (admin only)
exports.getPendingReviews = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
    const reviews = await Review.getPendingReviews(limit, offset);
    
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews
      }
    });
  } catch (error) {
    next(error);
  }
};

// Approve or reject a review (admin only)
exports.updateReviewStatus = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return next(new AppError('Status must be either approved or rejected', 400));
    }
    
    // Check if review exists
    const review = await Review.findById(reviewId);
    if (!review) {
      return next(new AppError('Review not found', 404));
    }
    
    // Update review status
    const success = await Review.update(reviewId, {
      ...review,
      status
    });
    
    if (!success) {
      return next(new AppError('Failed to update review status', 500));
    }
    
    res.status(200).json({
      status: 'success',
      message: `Review ${status} successfully`
    });
  } catch (error) {
    next(error);
  }
}; 