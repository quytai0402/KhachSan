const express = require('express');
const router = express.Router();
const { auth, staff } = require('../middleware/auth');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');

// @route   GET api/staff/dashboard
// @desc    Get dashboard data for staff
// @access  Private (Staff only)
router.get('/dashboard', [auth, staff], async (req, res) => {
  try {
    console.log('Fetching staff dashboard data...');
    
    // Get count of total rooms
    const rooms = await Room.find().populate('type');
    
    // Get bookings data with populated room and user information
    const bookings = await Booking.find()
      .populate('room')
      .populate('user')
      .sort({ createdAt: -1 });
    
    console.log(`Found: ${rooms.length} rooms, ${bookings.length} bookings`);
    
    // Calculate today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const todayBookings = bookings.filter(booking => {
      const checkIn = new Date(booking.checkInDate);
      checkIn.setHours(0, 0, 0, 0);
      return checkIn.getTime() === today.getTime();
    });
    
    // Get active guests (checked-in)
    const activeGuests = bookings.filter(booking => booking.status === 'checked-in');
    
    // Get pending tasks/services
    const pendingServices = await Service.find({ status: 'pending' }).countDocuments();
    const roomsNeedCleaning = await Room.find({ status: 'vacant-dirty' }).countDocuments();
    
    console.log(`Today's bookings: ${todayBookings.length}, Active guests: ${activeGuests.length}`);
    console.log(`Pending services: ${pendingServices}, Rooms need cleaning: ${roomsNeedCleaning}`);
    
    // Calculate revenue for different periods
    const calculateRevenue = (bookings, period) => {
      return bookings.reduce((total, booking) => {
        if (booking.status === 'checked-out' || booking.status === 'confirmed' || booking.status === 'checked-in') {
          if (period === 'today') {
            const checkOutDate = new Date(booking.checkOutDate);
            if (checkOutDate >= today && checkOutDate < tomorrow) {
              return total + (booking.totalPrice || 0);
            }
          } else if (period === 'week') {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);
            
            const checkOutDate = new Date(booking.checkOutDate);
            if (checkOutDate >= weekStart && checkOutDate < weekEnd) {
              return total + (booking.totalPrice || 0);
            }
          } else if (period === 'month') {
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            
            const checkOutDate = new Date(booking.checkOutDate);
            if (checkOutDate >= monthStart && checkOutDate <= monthEnd) {
              return total + (booking.totalPrice || 0);
            }
          }
        }
        return total;
      }, 0);
    };
    
    // Calculate revenue
    const todayRevenue = calculateRevenue(bookings, 'today');
    const weekRevenue = calculateRevenue(bookings, 'week');
    const monthRevenue = calculateRevenue(bookings, 'month');
    
    console.log(`Revenue: Today: ${todayRevenue}, Week: ${weekRevenue}, Month: ${monthRevenue}`);
    
    // Count room status
    const availableRooms = rooms.filter(room => 
      room.status === 'available' || room.status === 'vacant-clean').length;
    
    const bookedRooms = rooms.filter(room => 
      room.status === 'booked' || room.status === 'occupied').length;
    
    const maintenanceRooms = rooms.filter(room => 
      room.status === 'maintenance').length;
    
    // Count booking status
    const pendingBookings = bookings.filter(booking => 
      booking.status === 'pending').length;
    
    const confirmedBookings = bookings.filter(booking => 
      booking.status === 'confirmed').length;
    
    const checkedInBookings = bookings.filter(booking => 
      booking.status === 'checked-in').length;
    
    const cancelledBookings = bookings.filter(booking => 
      booking.status === 'cancelled').length;
    
    // Format data structure for staff dashboard
    const dashboardData = {
      // For compatibility with staff-specific components
      totalRooms: rooms.length,
      availableRooms: availableRooms,
      todayBookings: todayBookings.length,
      activeGuests: activeGuests.length,
      
      // Room stats in admin-compatible format
      rooms: {
        total: rooms.length,
        available: availableRooms,
        booked: bookedRooms,
        maintenance: maintenanceRooms
      },
      
      // Booking stats in admin-compatible format
      bookings: {
        total: bookings.length,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        checkedIn: checkedInBookings,
        cancelled: cancelledBookings
      },
      
      // Task-related information
      tasks: {
        total: pendingServices + roomsNeedCleaning,
        rooms: roomsNeedCleaning,
        services: pendingServices
      },
      
      // Revenue information
      revenue: {
        today: todayRevenue,
        thisWeek: weekRevenue,
        thisMonth: monthRevenue
      },
      
      // Recent bookings for display
      bookingsData: bookings.slice(0, 5).map(booking => ({
        _id: booking._id,
        roomNumber: booking.room?.roomNumber || 'N/A',
        guestName: booking.guestName || (booking.user && booking.user.name) || 'N/A',
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        status: booking.status,
        createdAt: booking.createdAt
      })),
      
      // Room data for display
      roomsData: rooms.slice(0, 8).map(room => ({
        _id: room._id,
        roomNumber: room.roomNumber || 'N/A',
        type: room.type?.name || 'Standard',
        status: room.status,
        price: room.price
      }))
    };
    
    console.log('Staff dashboard data prepared successfully');
    res.json(dashboardData);
  } catch (err) {
    console.error('Error fetching staff dashboard data:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/staff/rooms
// @desc    Get all rooms (staff version)
// @access  Private (Staff only)
router.get('/rooms', [auth, staff], async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/staff/rooms/:id
// @desc    Update room status (staff permission limited)
// @access  Private (Staff only)
router.put('/rooms/:id', [auth, staff], async (req, res) => {
  const { status, cleaningStatus, notes } = req.body;

  // Build update object - staff can only update status, cleaning status and notes
  const roomFields = {};
  if (status) roomFields.status = status;
  if (cleaningStatus) roomFields.cleaningStatus = cleaningStatus;
  if (notes) roomFields.notes = notes;
  
  // Add last updated timestamp and user
  roomFields.lastUpdated = Date.now();
  roomFields.lastUpdatedBy = req.user.id;

  try {
    // Check if room exists
    let room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Update room with limited fields
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

// @route   GET api/staff/bookings
// @desc    Get all bookings (staff version)
// @access  Private (Staff only)
router.get('/bookings', [auth, staff], async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ checkIn: -1 })
      .populate('room', 'roomNumber type');
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/staff/bookings/:id
// @desc    Update booking (staff permission limited)
// @access  Private (Staff only)
router.put('/bookings/:id', [auth, staff], async (req, res) => {
  const { status, roomNumber, paymentStatus, notes } = req.body;

  // Build update object
  const bookingFields = {};
  if (status) bookingFields.status = status;
  if (roomNumber) bookingFields.roomNumber = roomNumber;
  if (paymentStatus) bookingFields.paymentStatus = paymentStatus;
  if (notes) bookingFields.notes = notes;

  try {
    // Check if booking exists
    let booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update booking
    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: bookingFields },
      { new: true }
    );

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/staff/bookings/:id/check-in
// @desc    Check in a guest
// @access  Private (Staff only)
router.put('/bookings/:id/check-in', [auth, staff], async (req, res) => {
  const { roomNumber, notes } = req.body;

  try {
    // Check if booking exists
    let booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update booking status to checked-in
    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          status: 'checked-in', 
          roomNumber, 
          notes, 
          checkInTime: new Date(),
          checkedInBy: req.user.id
        } 
      },
      { new: true }
    );

    // Update room status to occupied
    if (roomNumber) {
      await Room.findOneAndUpdate(
        { roomNumber },
        { $set: { status: 'occupied' } }
      );
    }

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/staff/bookings/:id/check-out
// @desc    Check out a guest
// @access  Private (Staff only)
router.put('/bookings/:id/check-out', [auth, staff], async (req, res) => {
  const { notes } = req.body;

  try {
    // Check if booking exists
    let booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update booking status to checked-out
    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          status: 'checked-out', 
          notes,
          checkOutTime: new Date(),
          checkedOutBy: req.user.id
        } 
      },
      { new: true }
    );

    // Update room status to vacant-dirty
    if (booking.roomNumber) {
      await Room.findOneAndUpdate(
        { roomNumber: booking.roomNumber },
        { 
          $set: { 
            status: 'vacant-dirty',
            cleaningStatus: 'dirty' 
          } 
        }
      );
    }

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/staff/schedule
// @desc    Get staff schedule (check-ins, check-outs, cleanings, services)
// @access  Private (Staff only)
router.get('/schedule', [auth, staff], async (req, res) => {
  try {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Get arrivals (check-ins for today)
    const arrivals = await Booking.find({
      checkIn: { $gte: today, $lt: tomorrow },
      status: { $in: ['confirmed', 'pending'] }
    }).populate('user', 'name email phone');
    
    // Get departures (check-outs for today)
    const departures = await Booking.find({
      checkOut: { $gte: today, $lt: tomorrow },
      status: 'checked-in'
    }).populate('user', 'name email phone');
    
    // Get rooms that need cleaning
    const cleanings = await Room.find({
      $or: [
        { status: 'vacant-dirty' },
        { cleaningStatus: 'dirty' }
      ]
    });
    
    // Get service requests
    // Note: This assumes you have a Service model - adjust as needed
    const services = []; // Placeholder for service requests
    
    res.json({
      arrivals,
      departures,
      cleanings,
      services
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/staff/guests
// @desc    Get all checked-in guests
// @access  Private (Staff only)
router.get('/guests', [auth, staff], async (req, res) => {
  try {
    const checkedInBookings = await Booking.find({ status: 'checked-in' })
      .populate('user', 'name email phone')
      .sort({ checkIn: -1 });
      
    // Format data for frontend
    const guests = checkedInBookings.map(booking => ({
      id: booking._id,
      name: booking.guestName || (booking.user ? booking.user.name : 'Guest'),
      roomNumber: booking.roomNumber,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      phone: booking.phone || (booking.user ? booking.user.phone : ''),
      email: booking.email || (booking.user ? booking.user.email : ''),
      guestCount: booking.guestCount,
      specialRequests: booking.specialRequests,
      status: booking.status
    }));
    
    res.json(guests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/staff/guest-requests
// @desc    Get all guest service requests
// @access  Private (Staff only)
router.get('/guest-requests', [auth, staff], async (req, res) => {
  try {
    // Note: This assumes you have a ServiceRequest model - adjust as needed
    // Placeholder for service requests
    const requests = [
      {
        id: 101,
        guestId: 1,
        guestName: 'Nguyễn Văn A',
        roomNumber: '101',
        type: 'room_service',
        details: 'Thêm khăn tắm',
        status: 'pending',
        priority: 'normal',
        createdAt: new Date().toISOString(),
        assignedTo: 'Nhân viên A',
        notes: ''
      },
      {
        id: 102,
        guestId: 2,
        guestName: 'Trần Thị B',
        roomNumber: '203',
        type: 'housekeeping',
        details: 'Dọn phòng',
        status: 'in_progress',
        priority: 'high',
        createdAt: new Date().toISOString(),
        assignedTo: 'Nhân viên B',
        notes: 'Khách yêu cầu dọn phòng ngay'
      }
    ];
    
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/staff/activities
// @desc    Get recent activities for staff
// @access  Private (Staff only)
router.get('/activities', [auth, staff], async (req, res) => {
  try {
    // In a real implementation, you would fetch recent activities from a dedicated collection
    // For now, return an empty array
    res.json([]);
  } catch (err) {
    console.error('Error fetching staff activities:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 