const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const Room = require('../models/Room');
const multer = require('multer');
const path = require('path');

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/rooms');
  },
  filename: (req, file, cb) => {
    cb(null, `room-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
});

// @route   GET api/rooms
// @desc    Get all rooms
// @access  Public
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/rooms/available
// @desc    Get available rooms by date range
// @access  Public
router.get('/available', async (req, res) => {
  const { checkIn, checkOut } = req.query;

  if (!checkIn || !checkOut) {
    return res.status(400).json({ message: 'Check-in and check-out dates are required' });
  }

  try {
    // TODO: Implement logic to find available rooms for the given date range
    // This will require a query to the Booking model to check overlapping dates
    const availableRooms = await Room.find({ status: 'available' });
    res.json(availableRooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/rooms/:id
// @desc    Get room by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/rooms
// @desc    Create a room
// @access  Private (Admin only)
router.post('/', [auth, admin, upload.array('images', 5)], async (req, res) => {
  const { roomNumber, type, description, price, capacity, amenities, floor } = req.body;

  try {
    // Check if room number already exists
    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room number already exists' });
    }

    // Process amenities (convert from string to array if needed)
    const amenitiesArray = typeof amenities === 'string' ? amenities.split(',') : amenities;

    // Create new room
    const newRoom = new Room({
      roomNumber,
      type,
      description,
      price,
      capacity,
      amenities: amenitiesArray,
      floor
    });

    // Add image paths if uploaded
    if (req.files && req.files.length > 0) {
      newRoom.images = req.files.map(file => `/uploads/rooms/${file.filename}`);
    }

    // Save room to database
    const room = await newRoom.save();
    res.json(room);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/rooms/:id
// @desc    Update a room
// @access  Private (Admin only)
router.put('/:id', [auth, admin, upload.array('images', 5)], async (req, res) => {
  const { roomNumber, type, description, price, capacity, amenities, status, floor } = req.body;

  // Build room object
  const roomFields = {};
  if (roomNumber) roomFields.roomNumber = roomNumber;
  if (type) roomFields.type = type;
  if (description) roomFields.description = description;
  if (price) roomFields.price = price;
  if (capacity) roomFields.capacity = capacity;
  if (amenities) {
    roomFields.amenities = typeof amenities === 'string' ? amenities.split(',') : amenities;
  }
  if (status) roomFields.status = status;
  if (floor) roomFields.floor = floor;

  try {
    // Check if room exists
    let room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Add image paths if uploaded
    if (req.files && req.files.length > 0) {
      roomFields.images = req.files.map(file => `/uploads/rooms/${file.filename}`);
    }

    // Update room
    room = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: roomFields },
      { new: true }
    );

    res.json(room);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/rooms/:id
// @desc    Delete a room
// @access  Private (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    // Check if room exists
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Delete room
    await Room.findByIdAndRemove(req.params.id);
    res.json({ message: 'Room removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 