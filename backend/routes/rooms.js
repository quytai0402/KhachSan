const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');
const { HTTP_STATUS, ERROR_MESSAGES, ROOM_STATUS } = require('../constants');

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
    // Convert string dates to Date objects
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    // Validate dates
    if (isNaN(checkInDate) || isNaN(checkOutDate)) {
      return res.status(400).json({ message: 'Invalid date format. Please use YYYY-MM-DD format.' });
    }
    
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }
    
    // Find rooms that are booked during the specified date range
    const Booking = require('../models/Booking');
    const bookedRooms = await Booking.find({
      $and: [
        { status: { $ne: 'cancelled' } }, // Exclude cancelled bookings
        {
          $or: [
            // Case 1: Booking starts during the requested period
            { checkInDate: { $gte: checkInDate, $lt: checkOutDate } },
            // Case 2: Booking ends during the requested period
            { checkOutDate: { $gt: checkInDate, $lte: checkOutDate } },
            // Case 3: Booking spans the entire requested period
            {
              $and: [
                { checkInDate: { $lte: checkInDate } },
                { checkOutDate: { $gte: checkOutDate } }
              ]
            }
          ]
        }
      ]
    }).distinct('room');
    
    // Find all rooms that are not in the bookedRooms array and not in maintenance
    const availableRooms = await Room.find({
      _id: { $nin: bookedRooms },
      status: { $nin: ['maintenance', 'cleaning'] } // Exclude rooms in maintenance or cleaning
    }).populate('type');
    
    console.log(`Found ${availableRooms.length} available rooms for ${checkIn} to ${checkOut}`);
    res.json(availableRooms);
  } catch (err) {
    console.error('Error finding available rooms:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET api/rooms
// @desc    Get all rooms
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const rooms = await Room.find().sort({ createdAt: -1 }).populate('type');
  res.json({ success: true, data: rooms });
}));

// @route   GET api/rooms/:id
// @desc    Get room by ID
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id).populate('type');
  if (!room) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ 
      message: ERROR_MESSAGES.ROOM_NOT_FOUND 
    });
  }
  res.json({ success: true, data: room });
}));

// Note: The featured route was duplicated and has been removed. 
// The first instance of this route earlier in the file is preserved.

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