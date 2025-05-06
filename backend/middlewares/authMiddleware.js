const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/user');
const { AppError } = require('./errorHandler');

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  try {
    console.log('Protect middleware called');
    // 1) Get the token from request headers
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found in authorization header');
    }

    if (!token) {
      console.log('No token found in request');
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    // Try to manually decode token to see its contents (without verification)
    try {
      const manualDecode = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      console.log('Manual token decode:', manualDecode);
    } catch (decodeErr) {
      console.log('Failed to manually decode token:', decodeErr.message);
    }

    // 2) Verify the token
    console.log('Verifying token...');
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('JWT_SECRET value (first 3 chars):', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 3) : 'none');
    
    try {
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      console.log('Token verified, decoded:', decoded);
      
      // Log token payload details
      console.log('Token payload - id type:', typeof decoded.id);
      console.log('Token payload - id value:', decoded.id);
      console.log('Token payload - role:', decoded.role);
      
      // 3) Check if user still exists
      console.log('Finding user with ID:', decoded.id);
      try {
        // Use the safer method
        const user = await User.safeFindById(decoded.id);
        
        if (!user) {
          console.log('User not found or database error occurred');
          return next(new AppError('The user associated with this token could not be found.', 401));
        }
        
        console.log('User found:', user.user_id);
        
        // 4) Grant access to protected route
        req.user = user;
        next();
      } catch (userLookupError) {
        console.error('Error during user lookup:', userLookupError);
        return next(new AppError('Error accessing user data', 500));
      }
    } catch (jwtError) {
      console.log('JWT verification error:', jwtError.message, jwtError.name);
      if (jwtError.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token. Please log in again.', 401));
      }
      if (jwtError.name === 'TokenExpiredError') {
        return next(new AppError('Your token has expired. Please log in again.', 401));
      }
      throw jwtError; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('Protect middleware error:', error.message, error.stack);
    next(error);
  }
};

// Middleware to restrict access to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role_name)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
}; 