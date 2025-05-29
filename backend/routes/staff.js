const express = require('express');
const router = express.Router();
const { auth, staff } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { 
  ROOM_STATUS, 
  BOOKING_STATUS, 
  SERVICE_STATUS, 
  HTTP_STATUS, 
  ERROR_MESSAGES 
} = require('../constants');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');

// @route   GET api/staff/dashboard
// @desc    Get dashboard data for staff
// @access  Private (Staff only)
router.get('/dashboard', [auth, staff], asyncHandler(async (req, res) => {
  console.log('Fetching staff dashboard data...');
  
  const rooms = await Room.find().populate('type');
  const bookings = await Booking.find()
    .populate('room')
    .populate('user')
    .sort({ createdAt: -1 });
  
  console.log(`Found: ${rooms.length} rooms, ${bookings.length} bookings`);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const todayBookings = bookings.filter(booking => {
    const checkIn = new Date(booking.checkInDate);
    checkIn.setHours(0, 0, 0, 0);
    return checkIn.getTime() === today.getTime();
  });
  
  const activeGuests = bookings.filter(booking => booking.status === BOOKING_STATUS.CHECKED_IN);
  const pendingServices = await Service.find({ status: SERVICE_STATUS.PENDING }).countDocuments();
  const roomsNeedCleaning = await Room.find({ status: ROOM_STATUS.VACANT_DIRTY }).countDocuments();
  
  const calculateRevenue = (bookings, period) => {
    return bookings.reduce((total, booking) => {
      if (booking.status === BOOKING_STATUS.CHECKED_OUT || 
          booking.status === BOOKING_STATUS.CONFIRMED || 
          booking.status === BOOKING_STATUS.CHECKED_IN) {
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
  
  const todayRevenue = calculateRevenue(bookings, 'today');
  const weekRevenue = calculateRevenue(bookings, 'week');
  const monthRevenue = calculateRevenue(bookings, 'month');
  
  const availableRooms = rooms.filter(room => 
    room.status === ROOM_STATUS.AVAILABLE || room.status === ROOM_STATUS.VACANT_CLEAN).length;
  
  const bookedRooms = rooms.filter(room => 
    room.status === ROOM_STATUS.BOOKED || room.status === ROOM_STATUS.OCCUPIED).length;
  
  const maintenanceRooms = rooms.filter(room => 
    room.status === ROOM_STATUS.MAINTENANCE).length;
  
  const pendingBookings = bookings.filter(booking => 
    booking.status === BOOKING_STATUS.PENDING).length;
  
  const confirmedBookings = bookings.filter(booking => 
    booking.status === BOOKING_STATUS.CONFIRMED).length;
  
  const checkedInBookings = bookings.filter(booking => 
    booking.status === BOOKING_STATUS.CHECKED_IN).length;
  
  const cancelledBookings = bookings.filter(booking => 
    booking.status === BOOKING_STATUS.CANCELLED).length;
  
  const dashboardData = {
    totalRooms: rooms.length,
    availableRooms: availableRooms,
    todayBookings: todayBookings.length,
    activeGuests: activeGuests.length,
    
    rooms: {
      total: rooms.length,
      available: availableRooms,
      booked: bookedRooms,
      maintenance: maintenanceRooms
    },
    
    bookings: {
      total: bookings.length,
      pending: pendingBookings,
      confirmed: confirmedBookings,
      checkedIn: checkedInBookings,
      cancelled: cancelledBookings
    },
    
    tasks: {
      total: pendingServices + roomsNeedCleaning,
      rooms: roomsNeedCleaning,
      services: pendingServices
    },
    
    revenue: {
      today: todayRevenue,
      thisWeek: weekRevenue,
      thisMonth: monthRevenue
    },
    
    bookingsData: bookings.slice(0, 5).map(booking => ({
      _id: booking._id,
      roomNumber: booking.room?.roomNumber || 'N/A',
      guestName: booking.guestName || (booking.user && booking.user.name) || 'N/A',
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      status: booking.status,
      createdAt: booking.createdAt
    })),
    
    roomsData: rooms.slice(0, 8).map(room => ({
      _id: room._id,
      roomNumber: room.roomNumber || 'N/A',
      type: room.type?.name || 'Standard',
      status: room.status,
      price: room.price
    }))
  };
  
  console.log('Staff dashboard data prepared successfully');
  res.status(HTTP_STATUS.OK).json({ success: true, data: dashboardData });
}));

// @route   GET api/staff/rooms
// @desc    Get all rooms (staff version)
// @access  Private (Staff only)
router.get('/rooms', [auth, staff], asyncHandler(async (req, res) => {
  const rooms = await Room.find().sort({ roomNumber: 1 });
  res.status(HTTP_STATUS.OK).json({ success: true, data: rooms });
}));

// @route   POST api/staff/rooms/:id/status
// @desc    Update room status
// @access  Private (Staff only)
router.post('/rooms/:id/status', [auth, staff], asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const validStatuses = Object.values(ROOM_STATUS);
  if (!validStatuses.includes(status)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }
  
  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: ERROR_MESSAGES.ROOM_NOT_FOUND
    });
  }
  
  room.status = status;
  room.lastUpdated = new Date();
  room.updatedBy = req.user.id;
  
  await room.save();
  
  res.status(HTTP_STATUS.OK).json({
    message: 'Room status updated successfully',
    room
  });
}));

// @route   GET api/staff/bookings
// @desc    Get all bookings (staff version)
// @access  Private (Staff only)
router.get('/bookings', [auth, staff], asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate('room')
    .populate('user')
    .sort({ createdAt: -1 });
  
  res.status(HTTP_STATUS.OK).json({ success: true, data: bookings });
}));

// @route   POST api/staff/bookings/:id/checkin
// @desc    Check in a guest
// @access  Private (Staff only)
router.post('/bookings/:id/checkin', [auth, staff], asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('room');
  
  if (!booking) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: ERROR_MESSAGES.BOOKING_NOT_FOUND
    });
  }
  
  if (booking.status !== BOOKING_STATUS.CONFIRMED) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: 'Booking must be confirmed before check-in'
    });
  }
  
  booking.status = BOOKING_STATUS.CHECKED_IN;
  booking.checkInTime = new Date();
  booking.checkedInBy = req.user.id;
  
  if (booking.room) {
    booking.room.status = ROOM_STATUS.OCCUPIED;
    await booking.room.save();
  }
  
  await booking.save();
  
  res.status(HTTP_STATUS.OK).json({
    message: 'Guest checked in successfully',
    booking
  });
}));

// @route   POST api/staff/bookings/:id/checkout
// @desc    Check out a guest
// @access  Private (Staff only)
router.post('/bookings/:id/checkout', [auth, staff], asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('room');
  
  if (!booking) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: ERROR_MESSAGES.BOOKING_NOT_FOUND
    });
  }
  
  if (booking.status !== BOOKING_STATUS.CHECKED_IN) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: 'Guest must be checked in before checkout'
    });
  }
  
  booking.status = BOOKING_STATUS.CHECKED_OUT;
  booking.checkOutTime = new Date();
  booking.checkedOutBy = req.user.id;
  
  if (booking.room) {
    booking.room.status = ROOM_STATUS.VACANT_DIRTY;
    await booking.room.save();
  }
  
  await booking.save();
  
  res.status(HTTP_STATUS.OK).json({
    message: 'Guest checked out successfully',
    booking
  });
}));

// @route   GET api/staff/services
// @desc    Get all service requests
// @access  Private (Staff only)
router.get('/services', [auth, staff], asyncHandler(async (req, res) => {
  const services = await Service.find()
    .populate('room')
    .populate('requestedBy')
    .sort({ createdAt: -1 });
  
  res.status(HTTP_STATUS.OK).json({ success: true, data: services });
}));

// @route   POST api/staff/services/:id/complete
// @desc    Mark service as completed
// @access  Private (Staff only)
router.post('/services/:id/complete', [auth, staff], asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  
  if (!service) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: 'Service request not found'
    });
  }
  
  service.status = SERVICE_STATUS.COMPLETED;
  service.completedAt = new Date();
  service.completedBy = req.user.id;
  
  await service.save();
  
  res.status(HTTP_STATUS.OK).json({
    message: 'Service marked as completed',
    service
  });
}));

module.exports = router;
