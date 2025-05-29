const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { auth, admin } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { 
  HTTP_STATUS, 
  ERROR_MESSAGES, 
  VALIDATION_RULES 
} = require('../constants');
const User = require('../models/User');

// @route   GET api/users
// @desc    Get all users (admin only)
// @access  Private
router.get('/', [auth, admin], asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.status(HTTP_STATUS.OK).json(users);
}));

// @route   GET api/users/:id
// @desc    Get user by ID (admin only)
// @access  Private
router.get('/:id', [auth, admin], asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ 
      message: ERROR_MESSAGES.USER_NOT_FOUND 
    });
  }
  
  res.status(HTTP_STATUS.OK).json(user);
}));

// @route   PUT api/users/me
// @desc    Update current user profile
// @access  Private
router.put('/me', auth, asyncHandler(async (req, res) => {
  const { name, email, phone, currentPassword, newPassword } = req.body;

  // Build user object
  const userFields = {};
  if (name) userFields.name = name;
  if (email) userFields.email = email;
  if (phone) userFields.phone = phone;

  let user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ 
      message: ERROR_MESSAGES.USER_NOT_FOUND 
    });
  }

  // If user wants to change password
  if (currentPassword && newPassword) {
    // Validate password length
    if (newPassword.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`
      });
    }

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
        message: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    userFields.password = await bcrypt.hash(newPassword, salt);
  }

  // Update user
  user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: userFields },
    { new: true }
  ).select('-password');

  res.status(HTTP_STATUS.OK).json(user);
}));

// @route   PUT api/users/:id
// @desc    Update user (admin only)
// @access  Private
router.put('/:id', [auth, admin], asyncHandler(async (req, res) => {
  const { name, email, phone, role, isActive } = req.body;

  // Build user object
  const userFields = {};
  if (name) userFields.name = name;
  if (email) userFields.email = email;
  if (phone) userFields.phone = phone;
  if (role) userFields.role = role;
  if (isActive !== undefined) userFields.isActive = isActive;

  let user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ 
      message: ERROR_MESSAGES.USER_NOT_FOUND 
    });
  }

  // Update user
  user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: userFields },
    { new: true }
  ).select('-password');

  res.status(HTTP_STATUS.OK).json(user);
}));

// @route   POST api/users/admin
// @desc    Create admin user (admin only)
// @access  Private
router.post('/admin', [auth, admin], asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Validate email format
  if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: ERROR_MESSAGES.INVALID_EMAIL
    });
  }

  // Validate password length
  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`
    });
  }

  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
      message: ERROR_MESSAGES.USER_EXISTS 
    });
  }

  // Create new user
  user = new User({
    name,
    email,
    password,
    phone,
    role: 'admin'
  });

  // Hash password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);

  // Save user to database
  await user.save();

  // Return user without password
  const returnUser = await User.findById(user.id).select('-password');
  res.status(HTTP_STATUS.CREATED).json(returnUser);
}));

// @route   DELETE api/users/:id
// @desc    Delete user (admin only)
// @access  Private
router.delete('/:id', [auth, admin], asyncHandler(async (req, res) => {
  // Find user
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ 
      message: ERROR_MESSAGES.USER_NOT_FOUND 
    });
  }

  // Check if trying to delete self
  if (user.id === req.user.id) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
      message: 'Cannot delete your own account' 
    });
  }

  // TODO: Add logic to check if the user has any critical associated data 
  // (e.g., active bookings as a guest, or assigned tasks as staff) before deleting.
  // If so, prevent deletion or offer an option to reassign/archive data.

  // Delete user
  await User.findByIdAndDelete(req.params.id);
  res.status(HTTP_STATUS.OK).json({ 
    message: 'User removed successfully' 
  });
}));

module.exports = router;