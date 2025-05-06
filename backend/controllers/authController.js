const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Role = require('../models/role');
const { AppError } = require('../middlewares/errorHandler');
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Sign up new user
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm, phoneNumber } = req.body;

    // Check if password and password confirmation match
    if (password !== passwordConfirm) {
      return next(new AppError('Passwords do not match', 400));
    }

    // Check if user with this email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    // Check if phone number is provided and if it's already in use
    if (phoneNumber) {
      const existingPhone = await User.findByPhoneNumber(phoneNumber);
      if (existingPhone) {
        return next(new AppError('Phone number already in use', 400));
      }
    }

    // Get default role (user role)
    const userRole = await Role.findByName('user');
    if (!userRole) {
      return next(new AppError('Default role not found', 500));
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      phoneNumber,
      roleId: userRole.role_id
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.userId, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Send response
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: newUser.userId,
          name: newUser.name,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          role: 'user'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Log in existing user
exports.login = async (req, res, next) => {
  try {
    console.log('Login attempt for:', req.body.email);
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Check if user exists and password is correct
    const user = await User.findByEmail(email);
    console.log('User found by email:', user ? user.user_id : 'No user found');
    
    if (!user || !(await User.comparePassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // Generate JWT token
    console.log('Generating token for user:', user.user_id, 'with role:', user.role_name);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    const token = jwt.sign(
      { id: user.user_id, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    console.log('Token generated successfully');

    // Send response
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phone_number,
          profilePicture: user.profile_picture,
          role: user.role_name
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// Google OAuth Login Success Handler
exports.googleLoginSuccess = (req, res) => {
  // If user is authenticated by passport
  if (req.user) {
    const user = req.user;
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.user_id, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}`);
  } else {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication failed`);
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    console.log('getCurrentUser called with user:', req.user ? req.user.user_id : 'No user');
    
    // Ensure we have a user (should be set by protect middleware)
    if (!req.user) {
      console.log('No user found in request');
      return next(new AppError('User not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Error in getCurrentUser:', error.message, error.stack);
    next(error);
  }
};

// Verify Firebase ID token and get user data
exports.verifyFirebaseToken = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return next(new AppError('No ID token provided', 400));
    }
    
    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Get user data from Firebase
    const userRecord = await admin.auth().getUser(decodedToken.uid);
    
    // Check if user exists in our database
    let user = await User.findByPhoneNumber(userRecord.phoneNumber);
    
    if (!user) {
      // If it's a new user, we need the name
      if (!req.body.name) {
        return next(new AppError('Please provide your name to complete registration', 400));
      }
      
      // Get default role (user role)
      const userRole = await Role.findByName('user');
      if (!userRole) {
        return next(new AppError('Default role not found', 500));
      }
      
      // Create new user with phone number
      user = await User.create({
        name: req.body.name,
        phoneNumber: userRecord.phoneNumber,
        roleId: userRole.role_id
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.user_id || user.userId, role: user.role_name || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    // Send response
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.user_id || user.userId,
          name: user.name,
          phoneNumber: user.phone_number || user.phoneNumber,
          role: user.role_name || 'user'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create admin user (protected, admin-only)
exports.createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    // Check if password and password confirmation match
    if (password !== passwordConfirm) {
      return next(new AppError('Passwords do not match', 400));
    }

    // Check if user with this email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    // Get admin role
    const adminRole = await Role.findByName('admin');
    if (!adminRole) {
      return next(new AppError('Admin role not found', 500));
    }

    // Create new admin user
    const newAdmin = await User.create({
      name,
      email,
      password,
      roleId: adminRole.role_id
    });

    // Send response (no token generated for admin creation)
    res.status(201).json({
      status: 'success',
      message: 'Admin user created successfully',
      data: {
        user: {
          id: newAdmin.userId,
          name: newAdmin.name,
          email: newAdmin.email,
          role: 'admin'
        }
      }
    });
  } catch (error) {
    next(error);
  }
}; 