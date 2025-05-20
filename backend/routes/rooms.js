const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/rooms');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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

// @route   GET api/rooms/types
// @desc    Get all room types
// @access  Public
router.get('/types', async (req, res) => {
  try {
    console.log('Fetching all room types');
    const roomTypes = await RoomType.find().sort({ name: 1 });
    res.json(roomTypes);
  } catch (err) {
    console.error('Error fetching room types:', err.message);
    res.status(500).json({ message: 'Server error retrieving room types' });
  }
});

// @route   GET api/rooms/featured
// @desc    Get featured rooms for homepage
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    // Get featured rooms - rooms that are available and have good features
    const featuredRooms = await Room.find({ 
      status: 'available',
      price: { $exists: true }
    })
    .populate('type')
    .sort({ price: -1 }) // Sort by price descending to get premium rooms first
    .limit(4); // Only get top 4 rooms
    
    res.json(featuredRooms);
  } catch (err) {
    console.error('Error fetching featured rooms:', err.message);
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

// @route   GET api/rooms
// @desc    Get all rooms
// @access  Public
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 }).populate('type');
    res.json(rooms);
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

// @route   GET api/rooms/featured
// @desc    Get featured rooms for homepage
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    // Get featured rooms - rooms that are available and have good features
    const featuredRooms = await Room.find({ 
      status: 'available',
      price: { $exists: true }
    })
    .populate('type')
    .sort({ price: -1 }) // Sort by price descending to get premium rooms first
    .limit(4); // Only get top 4 rooms
    
    res.json(featuredRooms);
  } catch (err) {
    console.error('Error fetching featured rooms:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/rooms
// @desc    Create a room
// @access  Private (Admin only)
router.post('/', [auth, admin, upload.array('images', 5)], async (req, res) => {
  const { roomNumber, type, description, price, capacity, amenities, floor } = req.body;

  try {
    console.log('Creating new room with data:', req.body);
    
    // Validate required fields
    if (!roomNumber || !type || !description || !price) {
      console.error('Missing required fields:', { roomNumber, type, description, price });
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if room number already exists
    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      console.error('Room number already exists:', roomNumber);
      return res.status(400).json({ message: 'Room number already exists' });
    }

    // Validate room type exists
    const roomTypeExists = await RoomType.findById(type);
    if (!roomTypeExists) {
      console.error('Invalid room type:', type);
      return res.status(400).json({ message: 'Invalid room type' });
    }

    // Process amenities (convert from string to array if needed)
    const amenitiesArray = typeof amenities === 'string' ? amenities.split(',').map(item => item.trim()) : amenities;

    // Create new room
    const newRoom = new Room({
      roomNumber,
      type,
      description,
      price,
      capacity: capacity || 2, // Default capacity to 2 if not provided
      amenities: amenitiesArray || [],
      floor: floor || 1, // Default floor to 1 if not provided
      lastUpdatedBy: req.user.id // Set lastUpdatedBy to the logged-in admin user
    });

    // Add image paths if uploaded
    if (req.files && req.files.length > 0) {
      console.log('Processing uploaded images:', req.files.length);
      newRoom.images = req.files.map(file => `/uploads/rooms/${file.filename}`);
    }

    // Save room to database
    const room = await newRoom.save();
    console.log('Room created successfully:', room._id);
    res.status(201).json(room); // Changed to 201 for resource creation
  } catch (err) {
    console.error('Error creating room:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: err.errors });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT api/rooms/:id
// @desc    Update a room
// @access  Private (Admin only)
router.put('/:id', [auth, admin, upload.array('images', 5)], async (req, res) => {
  const { roomNumber, type, description, price, capacity, amenities, status, floor, cleaningStatus, notes } = req.body;

  // Build room object
  const roomFields = {};
  if (roomNumber) roomFields.roomNumber = roomNumber;
  if (type) roomFields.type = type;
  if (description) roomFields.description = description;
  if (price) roomFields.price = price;
  if (capacity) roomFields.capacity = capacity;
  if (amenities) {
    roomFields.amenities = typeof amenities === 'string' ? amenities.split(',').map(item => item.trim()) : amenities;
  }
  if (status) roomFields.status = status;
  if (floor) roomFields.floor = floor;
  if (cleaningStatus) roomFields.cleaningStatus = cleaningStatus;
  if (notes) roomFields.notes = notes;
  roomFields.lastUpdatedBy = req.user.id; // Set lastUpdatedBy to the logged-in admin user

  try {
    // Check if room exists
    let room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // If room number is being changed, check if the new room number already exists
    if (roomNumber && roomNumber !== room.roomNumber) {
        const existingRoom = await Room.findOne({ roomNumber });
        if (existingRoom) {
            return res.status(400).json({ message: 'Room number already exists' });
        }
    }

    // Validate room type exists if it's being updated
    if (type) {
        const roomTypeExists = await RoomType.findById(type);
        if (!roomTypeExists) {
            return res.status(400).json({ message: 'Invalid room type' });
        }
    }

    // Add image paths if uploaded
    if (req.files && req.files.length > 0) {
      // Optionally, remove old images if new ones are uploaded and you want to replace them
      // This would require more logic to handle specific image deletions or appending new ones.
      // For simplicity, this example replaces all images if new ones are provided.
      roomFields.images = req.files.map(file => `/uploads/rooms/${file.filename}`);
    }

    // Update room
    room = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: roomFields },
      { new: true, runValidators: true } // Added runValidators to ensure schema validation on update
    ).populate('type').populate('lastUpdatedBy', 'name email'); // Populate referenced fields

    res.json(room);
  } catch (err) {
    console.error('Error updating room:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Room not found' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: err.errors });
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

    // TODO: Add logic to check if the room has any active bookings before deleting.
    // If it does, prevent deletion or offer an option to reassign bookings.

    // Delete room images from the server
    if (room.images && room.images.length > 0) {
      room.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    await Room.findByIdAndDelete(req.params.id); // Changed from findByIdAndRemove
    res.json({ message: 'Room removed successfully' });
  } catch (err) {
    console.error('Error deleting room:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;