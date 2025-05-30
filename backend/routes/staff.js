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
const GuestRequest = require('../models/GuestRequest');

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
  const pendingServices = await GuestRequest.find({ status: SERVICE_STATUS.PENDING }).countDocuments();
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

// @route   POST api/staff/bookings/:id/check-in
// @desc    Check in a guest
// @access  Private (Staff only)
router.post('/bookings/:id/check-in', [auth, staff], asyncHandler(async (req, res) => {
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

// @route   POST api/staff/bookings/:id/check-out
// @desc    Check out a guest
// @access  Private (Staff only)
router.post('/bookings/:id/check-out', [auth, staff], asyncHandler(async (req, res) => {
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
// @desc    Get all guest requests and service requests
// @access  Private (Staff only)
router.get('/services', [auth, staff], asyncHandler(async (req, res) => {
  // Get guest requests
  const guestRequests = await GuestRequest.find()
    .populate('room')
    .populate('booking')
    .populate('requestedBy')
    .populate('assignedTo')
    .sort({ createdAt: -1 });
  
  // Format guest requests to match expected structure
  const formattedGuestRequests = guestRequests.map(request => ({
    _id: request._id,
    type: request.type,
    title: request.title,
    description: request.description,
    details: request.description, // For compatibility
    priority: request.priority,
    status: request.status,
    room: request.room,
    booking: request.booking,
    guestName: request.guestName,
    guestPhone: request.guestPhone,
    roomNumber: request.room?.roomNumber || 'N/A',
    requestedBy: request.requestedBy,
    assignedTo: request.assignedTo,
    notes: request.notes,
    costs: request.costs,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    completedAt: request.completedAt
  }));
  
  res.status(HTTP_STATUS.OK).json({ success: true, data: formattedGuestRequests });
}));

// @route   POST api/staff/services/:id/complete
// @desc    Mark guest request as completed
// @access  Private (Staff only)
router.post('/services/:id/complete', [auth, staff], asyncHandler(async (req, res) => {
  const guestRequest = await GuestRequest.findById(req.params.id);
  
  if (!guestRequest) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: 'Guest request not found'
    });
  }
  
  guestRequest.status = SERVICE_STATUS.COMPLETED;
  guestRequest.completedAt = new Date();
  guestRequest.completedBy = req.user.id;
  
  await guestRequest.save();
  
  res.status(HTTP_STATUS.OK).json({
    message: 'Guest request marked as completed',
    data: guestRequest
  });
}));

// @route   POST api/staff/services
// @desc    Create a new guest request
// @access  Private (Staff only)
router.post('/services', [auth, staff], asyncHandler(async (req, res) => {
  const { type, title, description, details, priority, roomId, bookingId, guestId, guestName, guestPhone } = req.body;

  // Find room if roomId provided
  let room = null;
  if (roomId) {
    room = await Room.findById(roomId);
    if (!room) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Room not found'
      });
    }
  }

  // Find booking if bookingId provided
  let booking = null;
  if (bookingId) {
    booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Booking not found'
      });
    }
  }

  const newGuestRequest = new GuestRequest({
    type: type || 'room_service',
    title: title || 'Guest Request',
    description: description || details || '',
    priority: priority || 'normal',
    room: roomId,
    booking: bookingId,
    requestedBy: guestId,
    guestName: guestName || '',
    guestPhone: guestPhone || '',
    status: SERVICE_STATUS.PENDING,
    createdAt: new Date()
  });

  await newGuestRequest.save();
  
  const populatedRequest = await GuestRequest.findById(newGuestRequest._id)
    .populate('room')
    .populate('booking')
    .populate('requestedBy');

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Guest request created successfully',
    data: populatedRequest
  });
}));

// @route   PUT api/staff/services/:id
// @desc    Update guest request
// @access  Private (Staff only)
router.put('/services/:id', [auth, staff], asyncHandler(async (req, res) => {
  const { status, notes, priority, assignedTo, costs } = req.body;

  const guestRequest = await GuestRequest.findById(req.params.id);
  
  if (!guestRequest) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: 'Guest request not found'
    });
  }

  // Update fields
  if (status) guestRequest.status = status;
  if (notes) guestRequest.notes = notes;
  if (priority) guestRequest.priority = priority;
  if (assignedTo) guestRequest.assignedTo = assignedTo;
  if (costs !== undefined) guestRequest.costs = costs;
  
  // Set completion time if status is completed
  if (status === SERVICE_STATUS.COMPLETED) {
    guestRequest.completedAt = new Date();
    guestRequest.completedBy = req.user.id;
  }

  guestRequest.updatedAt = new Date();
  await guestRequest.save();

  const updatedRequest = await GuestRequest.findById(guestRequest._id)
    .populate('room')
    .populate('booking')
    .populate('requestedBy')
    .populate('assignedTo')
    .populate('completedBy');

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Guest request updated successfully',
    data: updatedRequest
  });
}));

// @route   GET api/staff/guests
// @desc    Get all current guests for staff
// @access  Private (Staff only)
router.get('/guests', [auth, staff], asyncHandler(async (req, res) => {
  // Get all checked-in bookings with guest information
  const currentGuests = await Booking.find({
    status: BOOKING_STATUS.CHECKED_IN
  })
    .populate('room', ['roomNumber', 'type'])
    .populate('user', ['name', 'email', 'phone'])
    .sort({ checkInDate: -1 });

  // Format guest data for staff view
  const guestsData = currentGuests.map(booking => ({
    _id: booking._id,
    name: booking.guestName || (booking.user ? booking.user.name : 'Walk-in Guest'),
    email: booking.guestEmail || (booking.user ? booking.user.email : ''),
    phone: booking.guestPhone || (booking.user ? booking.user.phone : ''),
    roomNumber: booking.room ? booking.room.roomNumber : 'N/A',
    roomType: booking.room && booking.room.type ? booking.room.type.name : 'Standard',
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    status: booking.status,
    adults: booking.numberOfGuests?.adults || 1,
    children: booking.numberOfGuests?.children || 0,
    specialRequests: booking.specialRequests || ''
  }));

  res.status(HTTP_STATUS.OK).json({ success: true, data: guestsData });
}));

// @route   PUT api/staff/rooms/:id
// @desc    Update room details (staff version)
// @access  Private (Staff only)
router.put('/rooms/:id', [auth, staff], asyncHandler(async (req, res) => {
  const { status, cleaningStatus, notes, guestName } = req.body;
  
  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: ERROR_MESSAGES.ROOM_NOT_FOUND
    });
  }
  
  // Validate status if provided
  if (status) {
    const validStatuses = Object.values(ROOM_STATUS);
    if (!validStatuses.includes(status)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    room.status = status;
  }
  
  // Update other fields if provided
  if (cleaningStatus !== undefined) room.cleaningStatus = cleaningStatus;
  if (notes !== undefined) room.notes = notes;
  if (guestName !== undefined) room.guestName = guestName;
  
  room.lastUpdated = new Date();
  room.updatedBy = req.user.id;
  
  await room.save();
  
  res.status(HTTP_STATUS.OK).json(room);
}));

module.exports = router;
