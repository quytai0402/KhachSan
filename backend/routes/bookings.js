const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const { sendBookingConfirmation, sendBookingCancellation } = require('../utils/emailService');

// @route   GET api/bookings
// @desc    Get all bookings (admin only)
// @access  Private
router.get('/', [auth, admin], async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', ['name', 'email', 'phone'])
      .populate('room', ['roomNumber', 'type', 'price'])
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/bookings/me
// @desc    Get current user's bookings
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('room', ['roomNumber', 'type', 'price', 'images'])
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', ['name', 'email', 'phone'])
      .populate('room', ['roomNumber', 'type', 'price', 'images', 'amenities']);

    // Check if booking exists
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Make sure user owns the booking or is admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/bookings/room/:roomId
// @desc    Get bookings for a specific room
// @access  Public
router.get('/room/:roomId', async (req, res) => {
  try {
    // Find bookings for the specified room that are not cancelled
    // Only include future and current bookings
    const bookings = await Booking.find({
      room: req.params.roomId,
      status: { $ne: 'cancelled' }, // Not cancelled
      checkOutDate: { $gte: new Date() } // Check-out date is in the future or today
    })
    .select('checkInDate checkOutDate status')
    .sort({ checkInDate: 1 });
    
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/bookings
// @desc    Create a booking
// @access  Private
router.post('/', auth, async (req, res) => {
  const {
    roomId,
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

    // Check if room is available
    if (room.status !== 'available') {
      return res.status(400).json({ message: 'Room is not available' });
    }

    // Calculate the total price (number of days * room price)
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
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

    // Update room status to booked
    room.status = 'booked';
    await room.save();

    // Send booking confirmation email
    sendBookingConfirmation(user, booking, room).catch(err => 
      console.error('Failed to send booking confirmation email:', err)
    );

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/bookings/guest
// @desc    Create a booking for guest (without authentication)
// @access  Public
router.post('/guest', async (req, res) => {
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

    // Check if room is available
    if (room.status !== 'available') {
      return res.status(400).json({ message: 'Room is not available' });
    }

    // Calculate the total price (number of days * room price)
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
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

    // Update room status to booked
    room.status = 'booked';
    await room.save();

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/bookings/:id
// @desc    Update booking status
// @access  Private (Admin only)
router.put('/:id/status', [auth, admin], async (req, res) => {
  const { status } = req.body;

  try {
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
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/bookings/:id/payment
// @desc    Update payment status
// @access  Private (Admin only)
router.put('/:id/payment', [auth, admin], async (req, res) => {
  const { paymentStatus } = req.body;

  try {
    // Find the booking
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update payment status
    booking.paymentStatus = paymentStatus;
    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/bookings/:id
// @desc    Cancel a booking
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
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
      console.error('Failed to send booking cancellation email:', err)
    );

    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 