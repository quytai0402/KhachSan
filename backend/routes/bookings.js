const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const { sendBookingConfirmation, sendBookingCancellation } = require('../utils/emailService');
const socketEvents = require('../utils/socketEvents');
const asyncHandler = require('../middleware/asyncHandler');
const { HTTP_STATUS, ERROR_MESSAGES, BOOKING_STATUS, ROOM_STATUS } = require('../constants');

// @route   GET api/bookings
// @desc    Get all bookings (admin only)
// @access  Private
router.get('/', [auth, admin], asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate('user', ['name', 'email', 'phone'])
    .populate('room', ['roomNumber', 'type', 'price'])
    .sort({ createdAt: -1 });
  res.json({ success: true, data: bookings });
}));

// @route   GET api/bookings/me
// @desc    Get current user's bookings
// @access  Private
router.get('/me', auth, asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate('room', ['roomNumber', 'type', 'price', 'images'])
    .sort({ createdAt: -1 });
  res.json({ success: true, data: bookings });
}));

// @route   GET api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', auth, asyncHandler(async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', ['name', 'email', 'phone'])
      .populate('room', ['roomNumber', 'type', 'price', 'images', 'amenities']);

    // Check if booking exists
    if (!booking) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ 
        message: ERROR_MESSAGES.BOOKING_NOT_FOUND 
      });
    }

    // Make sure user owns the booking or is admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
        message: ERROR_MESSAGES.NOT_AUTHORIZED 
      });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}));

// @route   GET api/bookings/room/:roomId
// @desc    Get bookings for a specific room
// @access  Public
router.get('/room/:roomId', asyncHandler(async (req, res) => {
  // Find bookings for the specified room that are not cancelled
  // Only include future and current bookings
  const bookings = await Booking.find({
    room: req.params.roomId,
    status: { $ne: BOOKING_STATUS.CANCELLED }, // Not cancelled
    checkOutDate: { $gte: new Date() } // Check-out date is in the future or today
  })
  .select('checkInDate checkOutDate status')
  .sort({ checkInDate: 1 });
  
  res.json({ success: true, data: bookings });
}));

// @route   POST api/bookings
// @desc    Create a booking
// @access  Private
router.post('/', auth, asyncHandler(async (req, res) => {
  const {
    room: roomId,
    checkInDate,
    checkOutDate,
    adults,
    children,
    specialRequests
  } = req.body;

  try {
    // Find the room and user
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if room is available for booking
    // A room with status 'available' or 'booked' can still be reserved for future dates
    if (room.status === 'maintenance' || room.status === 'cleaning') {
      return res.status(400).json({ message: `Room is currently under ${room.status}` });
    }

    // Calculate the total price (number of days * room price)
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }
    
    // Check for booking conflicts
    const existingBookings = await Booking.find({
      room: roomId,
      status: { $ne: 'cancelled' }, // Not cancelled
      $or: [
        // Check if there's any overlap with existing bookings
        {
          checkInDate: { $lt: checkOutDate },
          checkOutDate: { $gt: checkInDate }
        }
      ]
    });
    
    if (existingBookings.length > 0) {
      return res.status(400).json({ 
        message: 'Room is already booked for the selected dates',
        conflictingDates: existingBookings.map(booking => ({
          checkIn: booking.checkInDate,
          checkOut: booking.checkOutDate
        }))
      });
    }
    
    const totalPrice = days * room.price;

    // Create new booking
    const newBooking = new Booking({
      user: req.user.id,
      room: roomId,
      checkInDate,
      checkOutDate,
      numberOfGuests: {
        adults: adults || 1,
        children: children || 0
      },
      totalPrice,
      specialRequests
    });

    // Save booking to database
    const booking = await newBooking.save();

    // Update room status to booked only if the check-in date is today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkInDateOnly = new Date(checkIn);
    checkInDateOnly.setHours(0, 0, 0, 0);
    
    if (checkInDateOnly.getTime() === today.getTime()) {
      room.status = 'booked';
      await room.save();
      
      // Emit room status change event
      if (req.io) {
        req.io.emit(socketEvents.ROOM_STATUS_CHANGED, {
          roomId: room._id,
          status: room.status
        });
      }
    }

    // Send booking confirmation email
    sendBookingConfirmation(user, booking, room).catch(err => 
      console.error('Failed to send booking confirmation email:', err)
    );

    // Emit booking created event to admin and staff
    if (req.io) {
      const populatedBooking = await Booking.findById(booking._id)
        .populate('user', ['name', 'email', 'phone'])
        .populate('room', ['roomNumber', 'type', 'price']);
        
      socketEvents.emitToRoles(req.io, socketEvents.BOOKING_CREATED, populatedBooking);
      
      // Also notify the user
      socketEvents.emitToUser(req.io, req.user.id, socketEvents.BOOKING_CREATED, booking);
      
      // Send notification
      const notification = {
        message: `New booking #${booking._id.toString().slice(-6)} created for Room ${room.roomNumber}`,
        type: 'booking',
        data: {
          bookingId: booking._id,
          roomNumber: room.roomNumber,
          checkInDate,
          checkOutDate
        },
        timestamp: new Date()
      };
      
      socketEvents.emitToRoles(req.io, socketEvents.NOTIFICATION, notification);
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    console.error('Error creating booking:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Invalid room or user ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}));

// @route   POST api/bookings/guest
// @desc    Create a booking for guest (without authentication)
// @access  Public
router.post('/guest', asyncHandler(async (req, res) => {
  const {
    roomId,
    checkInDate,
    checkOutDate,
    adults,
    children,
    specialRequests,
    guestInfo
  } = req.body;

  // Validate guest information
  if (!guestInfo || !guestInfo.name || !guestInfo.email || !guestInfo.phone) {
    return res.status(400).json({ message: 'Guest information is required' });
  }

  try {
    // Find the room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if room is available for booking
    // A room with status 'available' or 'booked' can still be reserved for future dates
    if (room.status === 'maintenance' || room.status === 'cleaning') {
      return res.status(400).json({ message: `Room is currently under ${room.status}` });
    }

    // Calculate the total price (number of days * room price)
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }
    
    // Check for booking conflicts
    const existingBookings = await Booking.find({
      room: roomId,
      status: { $ne: 'cancelled' }, // Not cancelled
      $or: [
        // Check if there's any overlap with existing bookings
        {
          checkInDate: { $lt: checkOutDate },
          checkOutDate: { $gt: checkInDate }
        }
      ]
    });
    
    if (existingBookings.length > 0) {
      return res.status(400).json({ 
        message: 'Room is already booked for the selected dates',
        conflictingDates: existingBookings.map(booking => ({
          checkIn: booking.checkInDate,
          checkOut: booking.checkOutDate
        }))
      });
    }
    
    const totalPrice = days * room.price;

    // Create guest booking
    const newBooking = new Booking({
      guestName: guestInfo.name,
      guestEmail: guestInfo.email,
      guestPhone: guestInfo.phone,
      guestAddress: guestInfo.address || '',
      room: roomId,
      checkInDate,
      checkOutDate,
      numberOfGuests: {
        adults: adults || 1,
        children: children || 0
      },
      totalPrice,
      specialRequests,
      isGuestBooking: true
    });

    // Save booking to database
    const booking = await newBooking.save();

    // Update room status to booked only if the check-in date is today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkInDateOnly = new Date(checkIn);
    checkInDateOnly.setHours(0, 0, 0, 0);
    
    if (checkInDateOnly.getTime() === today.getTime()) {
      room.status = 'booked';
      await room.save();
      
      // Emit room status change event if socket is available
      if (req.io) {
        req.io.emit(socketEvents.ROOM_STATUS_CHANGED, {
          roomId: room._id,
          status: room.status
        });
        
        // Also emit booking created event
        const populatedBooking = await Booking.findById(booking._id)
          .populate('room', ['roomNumber', 'type', 'price']);
        
        socketEvents.emitToRoles(req.io, socketEvents.BOOKING_CREATED, populatedBooking);
        
        // Send notification
        const notification = {
          message: `New guest booking created for Room ${room.roomNumber}`,
          type: 'booking',
          data: {
            bookingId: booking._id,
            roomNumber: room.roomNumber,
            checkInDate,
            checkOutDate
          },
          timestamp: new Date()
        };
        
        socketEvents.emitToRoles(req.io, socketEvents.NOTIFICATION, notification);
      }
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    console.error('Error creating guest booking:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Invalid room ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}));

// @route   PUT api/bookings/:id/status
// @desc    Update booking status
// @access  Private (Admin only)
router.put('/:id/status', [auth, admin], asyncHandler(async (req, res) => {
  const { status } = req.body;

  // Find the booking
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  // Update booking status
  booking.status = status;
  
  // Update the room status based on the booking status
  if (status === 'checked-in') {
    await Room.findByIdAndUpdate(booking.room, { status: 'booked' });
  } else if (status === 'checked-out') {
    await Room.findByIdAndUpdate(booking.room, { status: 'cleaning' });
  } else if (status === 'cancelled') {
    await Room.findByIdAndUpdate(booking.room, { status: 'available' });
  }

  await booking.save();
  res.json({ success: true, data: booking });
}));

// @route   PUT api/bookings/:id/payment
// @desc    Update payment status
// @access  Private (Admin only)
router.put('/:id/payment', [auth, admin], asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;

  // Find the booking
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  // Update payment status
  booking.paymentStatus = paymentStatus;
  await booking.save();
  res.json({ success: true, data: booking });
}));

// @route   DELETE api/bookings/:id
// @desc    Cancel a booking
// @access  Private
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  // Find the booking
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  // Get user and room information for email
  const user = await User.findById(req.user.id);
  const room = await Room.findById(booking.room);

  // Check if user owns the booking or is admin
  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(401).json({ message: 'Not authorized' });
  }

  // Check if booking can be cancelled (e.g., not too close to check-in date)
  const now = new Date();
  const checkIn = new Date(booking.checkInDate);
  const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);
  
  if (hoursUntilCheckIn < 24 && req.user.role !== 'admin') {
    return res.status(400).json({ message: 'Bookings can only be cancelled at least 24 hours before check-in' });
  }

  // Update booking status
  booking.status = 'cancelled';
  await booking.save();

  // Free up the room
  await Room.findByIdAndUpdate(booking.room, { status: 'available' });

  // Send cancellation email
  sendBookingCancellation(user, booking, room).catch(err => 
    console.error('Failed to send booking cancellation email:', err)      );

  res.json({ success: true, message: 'Booking cancelled' });
}));

// @route   PUT api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:id/cancel', auth, asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('room', ['roomNumber', 'type', 'price']);

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  // Check if user is authorized
  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(401).json({ message: 'Not authorized' });
  }

  // Check if booking can be cancelled
  if (booking.status === 'cancelled') {
    return res.status(400).json({ message: 'Booking is already cancelled' });
  }

  // Cancel the booking
  booking.status = 'cancelled';
  booking.cancelledAt = Date.now();

  // If room is currently booked by this booking, update its status
  const room = await Room.findById(booking.room._id);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkInDate = new Date(booking.checkInDate);
  checkInDate.setHours(0, 0, 0, 0);
  
  const checkOutDate = new Date(booking.checkOutDate);
  checkOutDate.setHours(0, 0, 0, 0);
  
  // If the booking is for the current date range and the room is booked, update room status
  if (room.status === 'booked' && 
      today >= checkInDate && 
      today <= checkOutDate) {
    room.status = 'available';
    await room.save();
    
    // Emit room status change event
    if (req.io) {
      req.io.emit(socketEvents.ROOM_STATUS_CHANGED, {
        roomId: room._id,
        status: room.status
      });
    }
  }

  await booking.save();

  // Get user for email notification
  const user = await User.findById(booking.user);

  // Send cancellation email
  if (user) {
    sendBookingCancellation(user, booking, room).catch(err => 
      console.error('Failed to send booking cancellation email:', err)
    );
  }

  // Emit booking cancelled event
  if (req.io) {
    socketEvents.emitToRoles(req.io, socketEvents.BOOKING_CANCELED, booking);
    
    // Also notify the user if they didn't initiate the cancel
    if (booking.user.toString() !== req.user.id) {
      socketEvents.emitToUser(req.io, booking.user.toString(), socketEvents.BOOKING_CANCELED, booking);
    }
    
    // Send notification
    const notification = {
      message: `Booking #${booking._id.toString().slice(-6)} for Room ${room.roomNumber} has been cancelled`,
      type: 'booking',
      data: {
        bookingId: booking._id,
        roomNumber: room.roomNumber,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate
      },
      timestamp: new Date()
    };
    
    socketEvents.emitToRoles(req.io, socketEvents.NOTIFICATION, notification);
  }

  res.json({ success: true, data: booking });
}));

// @route   GET api/bookings/phone/:phoneNumber
// @desc    Get bookings by guest phone number
// @access  Public (for guest booking lookup)
router.get('/phone/:phoneNumber', asyncHandler(async (req, res) => {
  const { phoneNumber } = req.params;
  
  // Find all bookings with the given phone number
  const bookings = await Booking.find({ 
    isGuestBooking: true,
    guestPhone: phoneNumber 
  })
  .populate('room', ['roomNumber', 'type', 'price', 'images'])
  .sort({ createdAt: -1 });
  
  if (!bookings || bookings.length === 0) {
    return res.status(404).json({ message: 'No bookings found for this phone number' });
  }
  
  res.json({ success: true, data: bookings });
}));

module.exports = router;