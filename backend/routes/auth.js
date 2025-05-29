const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../utils/emailService');
const asyncHandler = require('../middleware/asyncHandler');
const { HTTP_STATUS, ERROR_MESSAGES, VALIDATION_RULES } = require('../constants');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
      success: false, 
      message: ERROR_MESSAGES.REQUIRED_FIELDS 
    });
  }

  // Email format validation
  const emailRegex = VALIDATION_RULES.EMAIL_REGEX;
  if (!emailRegex.test(email)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
      success: false, 
      message: ERROR_MESSAGES.INVALID_EMAIL 
    });
  }

  // Password strength validation
  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
      success: false, 
      message: ERROR_MESSAGES.PASSWORD_TOO_SHORT 
    });
  }

  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
      success: false, 
      message: ERROR_MESSAGES.USER_EXISTS 
    });
  }

  // Create new user
  user = new User({
    name,
    email,
    password,
    phone
  });

  // Hash password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);

  // Save user to database
  await user.save();

  // Try to send welcome email, but don't block registration if it fails
  try {
    sendWelcomeEmail(user).catch(err => console.error('Failed to send welcome email:', err));
  } catch (emailErr) {
    console.error('Error sending welcome email:', emailErr);
    // Continue with registration even if email fails
  }

  // Create payload for JWT
  const payload = {
    user: {
      id: user.id,
      role: user.role
    }
  };

  // Sign JWT
  jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '1d' },
    (err, token) => {
      if (err) throw err;
      res.json({ success: true, token });
    }
  );
}));

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt for:', email);

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    console.log('Login failed: User not found -', email);
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
      success: false, 
      message: ERROR_MESSAGES.INVALID_CREDENTIALS 
    });
  }

  // Check if user is active
  if (!user.isActive) {
    console.log('Login failed: Account is deactivated -', email);
    return res.status(HTTP_STATUS.FORBIDDEN).json({ 
      success: false, 
      message: ERROR_MESSAGES.ACCOUNT_DEACTIVATED 
    });
  }

  // Check if password matches
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    console.log('Login failed: Invalid password -', email);
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
      success: false, 
      message: ERROR_MESSAGES.INVALID_CREDENTIALS 
    });
  }

  console.log('Login successful for:', email, 'Role:', user.role);

  // Update last login
  user.lastLogin = Date.now();
  await user.save();

  // Create payload for JWT
  const payload = {
    user: {
      id: user.id,
      role: user.role
    }
  };

  // Sign JWT
  jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '1d' },
    (err, token) => {
      if (err) {
        console.error('JWT signing error:', err);
        throw err;
      }
      res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    }
  );
}));

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, asyncHandler(async (req, res) => {
  // Get user from database without password
  const user = await User.findById(req.user.id).select('-password');
  res.json({ success: true, data: user });
}));

// @route   GET api/auth/test-cors
// @desc    Test CORS setup
// @access  Public
router.get('/test-cors', (req, res) => {
  console.log('CORS test request received:', {
    headers: req.headers,
    method: req.method
  });
  
  res.json({
    success: true,
    message: 'CORS test successful',
    receivedHeaders: req.headers,
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 