const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { auth, admin } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/users
// @desc    Get all users (admin only)
// @access  Private
router.get('/', [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/:id
// @desc    Get user by ID (admin only)
// @access  Private
router.get('/:id', [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/me
// @desc    Update current user profile
// @access  Private
router.put('/me', auth, async (req, res) => {
  const { name, email, phone, currentPassword, newPassword } = req.body;

  // Build user object
  const userFields = {};
  if (name) userFields.name = name;
  if (email) userFields.email = email;
  if (phone) userFields.phone = phone;

  try {
    let user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user wants to change password
    if (currentPassword && newPassword) {
      // Check if current password is correct
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
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

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/:id
// @desc    Update user (admin only)
// @access  Private
router.put('/:id', [auth, admin], async (req, res) => {
  const { name, email, phone, role, isActive } = req.body;

  // Build user object
  const userFields = {};
  if (name) userFields.name = name;
  if (email) userFields.email = email;
  if (phone) userFields.phone = phone;
  if (role) userFields.role = role;
  if (isActive !== undefined) userFields.isActive = isActive;

  try {
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user
    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: userFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/users/admin
// @desc    Create admin user (admin only)
// @access  Private
router.post('/admin', [auth, admin], async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
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
    res.json(returnUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/users/:id
// @desc    Delete user (admin only)
// @access  Private
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    // Find user
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if trying to delete self
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // TODO: Add logic to check if the user has any critical associated data (e.g., active bookings as a guest, or assigned tasks as staff) before deleting.
    // If so, prevent deletion or offer an option to reassign/archive data.

    // Delete user
    await User.findByIdAndDelete(req.params.id); // Changed from findByIdAndRemove
    res.json({ message: 'User removed successfully' }); // Added 'successfully' for clarity
  } catch (err) {
    console.error('Error deleting user:', err.message); // Added context to console error
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;