const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { 
  ROOM_STATUS, 
  BOOKING_STATUS, 
  USER_ROLES, 
  HTTP_STATUS, 
  ERROR_MESSAGES 
} = require('../constants');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');

// @route   GET api/admin/dashboard
// @desc    Get dashboard data for admin
// @access  Private (Admin only)
router.get('/dashboard', [auth, admin], asyncHandler(async (req, res) => {
  console.log('Fetching admin dashboard data...');
  
  // Get all data needed for the dashboard with proper population
  const [rooms, bookings, users, services] = await Promise.all([
    Room.find().populate('type'),
    Booking.find().populate('room').populate('user').sort({ createdAt: -1 }),
    User.find(),
    Service.find().sort({ createdAt: -1 })
  ]);
  
  console.log(`Found: ${rooms.length} rooms, ${bookings.length} bookings, ${users.length} users, ${services.length} services`);
  
  // Calculate date ranges for revenue
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  // Calculate revenue for different periods
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
  
  // Calculate revenue
  const todayRevenue = calculateRevenue(bookings, 'today');
  const weekRevenue = calculateRevenue(bookings, 'week');
  const monthRevenue = calculateRevenue(bookings, 'month');
  
  // Count room status
  const availableRooms = rooms.filter(room => 
    room.status === ROOM_STATUS.AVAILABLE || room.status === ROOM_STATUS.VACANT_CLEAN).length;
  
  const bookedRooms = rooms.filter(room => 
    room.status === ROOM_STATUS.BOOKED || room.status === ROOM_STATUS.OCCUPIED).length;
  
  const maintenanceRooms = rooms.filter(room => 
    room.status === ROOM_STATUS.MAINTENANCE).length;
  
  // Count booking status
  const pendingBookings = bookings.filter(booking => 
    booking.status === BOOKING_STATUS.PENDING).length;
  
  const confirmedBookings = bookings.filter(booking => 
    booking.status === BOOKING_STATUS.CONFIRMED).length;
  
  const checkedInBookings = bookings.filter(booking => 
    booking.status === BOOKING_STATUS.CHECKED_IN).length;
  
  const cancelledBookings = bookings.filter(booking => 
    booking.status === BOOKING_STATUS.CANCELLED).length;
  
  const dashboardData = {
    rooms: {
      total: Number(rooms.length || 0),
      available: Number(availableRooms || 0),
      booked: Number(bookedRooms || 0),
      maintenance: Number(maintenanceRooms || 0)
    },
    bookings: {
      total: Number(bookings.length || 0),
      pending: Number(pendingBookings || 0),
      confirmed: Number(confirmedBookings || 0),
      checkedIn: Number(checkedInBookings || 0),
      cancelled: Number(cancelledBookings || 0)
    },
    users: {
      total: Number(users.length || 0),
      active: Number(users.filter(user => user.isActive).length || 0),
      inactive: Number(users.filter(user => !user.isActive).length || 0),
      staff: Number(users.filter(user => user.role === USER_ROLES.STAFF).length || 0),
      customers: Number(users.filter(user => user.role === USER_ROLES.USER).length || 0)
    },
    revenue: {
      today: Number(todayRevenue || 0),
      thisWeek: Number(weekRevenue || 0),
      thisMonth: Number(monthRevenue || 0)
    },
    bookingsData: bookings.slice(0, 5).map(booking => ({
      _id: booking._id,
      roomNumber: booking.room?.roomNumber || 'N/A',
      guestName: booking.guestName || (booking.user && booking.user.name) || 'N/A',
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      status: booking.status,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt
    })),
    statistics: {
      newUsers: users.filter(user => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(user.createdAt) >= thirtyDaysAgo;
      }).length,
      completedBookings: bookings.filter(booking => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return booking.status === BOOKING_STATUS.CHECKED_OUT && new Date(booking.checkOutDate) >= thirtyDaysAgo;
      }).length,
      serviceRequests: services.filter(service => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(service.createdAt) >= thirtyDaysAgo;
      }).length
    }
  };
  
  const guestBookings = bookings.filter(booking => booking.isGuestBooking);
  const uniqueGuestPhones = [...new Set(guestBookings.map(booking => booking.guestPhone))];
  const uniqueWalkInGuests = uniqueGuestPhones.length;
  
  const phoneBookingCounts = {};
  guestBookings.forEach(booking => {
    if (!phoneBookingCounts[booking.guestPhone]) {
      phoneBookingCounts[booking.guestPhone] = {
        count: 0,
        name: booking.guestName,
        phone: booking.guestPhone
      };
    }
    phoneBookingCounts[booking.guestPhone].count += 1;
  });
  
  const frequentGuestsList = Object.values(phoneBookingCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  dashboardData.guestStatistics = {
    totalUniqueGuests: uniqueWalkInGuests,
    frequentGuests: frequentGuestsList
  };
  
  console.log('Admin dashboard data prepared successfully');
  return res.status(HTTP_STATUS.OK).json(dashboardData);
}));

// @route   GET api/admin/activities
router.get('/activities', [auth, admin], asyncHandler(async (req, res) => {
  res.status(HTTP_STATUS.OK).json([]);
}));

// @route   GET api/admin/reports
router.get('/reports', [auth, admin], asyncHandler(async (req, res) => {
  console.log('Fetching admin report data...');
  
  const { startDate, endDate } = req.query;
  const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const end = endDate ? new Date(endDate) : new Date();
  
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  
  const [rooms, bookings, users] = await Promise.all([
    Room.find().populate('type'),
    Booking.find({
      createdAt: { $gte: start, $lte: end }
    }).populate('room').populate('user').sort({ createdAt: -1 }),
    User.find()
  ]);
  
  const totalRevenue = bookings.reduce((sum, booking) => {
    if (booking.status !== BOOKING_STATUS.CANCELLED) {
      return sum + (booking.totalPrice || 0);
    }
    return sum;
  }, 0);
  
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(booking => 
    booking.status === BOOKING_STATUS.CHECKED_OUT).length;
  const cancelledBookings = bookings.filter(booking => 
    booking.status === BOOKING_STATUS.CANCELLED).length;
  
  const totalGuests = bookings.reduce((sum, booking) => {
    const adults = booking.numberOfGuests?.adults || 1;
    const children = booking.numberOfGuests?.children || 0;
    return sum + adults + children;
  }, 0);
  
  const occupiedRooms = rooms.filter(room => 
    room.status === ROOM_STATUS.OCCUPIED || room.status === ROOM_STATUS.BOOKED).length;
  const occupancyRate = Math.round((occupiedRooms / (rooms.length || 1)) * 100);
  
  const revenueByMonth = calculateRevenueByMonth(bookings);
  const bookingsByRoomType = calculateBookingsByRoomType(bookings, rooms);
  
  const reportData = {
    totalRevenue,
    totalBookings,
    completedBookings,
    cancelledBookings,
    totalGuests,
    occupancyRate,
    revenueByMonth,
    bookingsByRoomType,
    recentBookings: bookings.slice(0, 5).map(booking => ({
      _id: booking._id,
      roomNumber: booking.room?.roomNumber || 'N/A',
      guestName: booking.guestName || (booking.user && booking.user.name) || 'N/A',
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      status: booking.status,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt
    }))
  };
  
  console.log('Admin report data prepared successfully');
  return res.status(HTTP_STATUS.OK).json(reportData);
}));

const calculateRevenueByMonth = (bookings) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const revenueByMonth = Array(12).fill(0);
  
  bookings.forEach(booking => {
    if (booking.status !== BOOKING_STATUS.CANCELLED && booking.createdAt) {
      const bookingDate = new Date(booking.createdAt);
      const monthIndex = bookingDate.getMonth();
      revenueByMonth[monthIndex] += (booking.totalPrice || 0);
    }
  });
  
  return months.map((month, index) => ({
    month,
    revenue: revenueByMonth[index]
  }));
};

const calculateBookingsByRoomType = (bookings, rooms) => {
  const roomTypesMap = {};
  rooms.forEach(room => {
    if (room.type && typeof room.type === 'object') {
      roomTypesMap[room._id] = room.type.name || 'Unknown';
    } else {
      roomTypesMap[room._id] = 'Unknown';
    }
  });
  
  const bookingCounts = {};
  
  bookings.forEach(booking => {
    if (booking.room) {
      let roomId = booking.room;
      
      if (typeof booking.room === 'object' && booking.room._id) {
        roomId = booking.room._id;
      }
      
      const roomType = roomTypesMap[roomId] || 'Unknown';
      bookingCounts[roomType] = (bookingCounts[roomType] || 0) + 1;
    }
  });
  
  return Object.keys(bookingCounts).map(type => ({
    type,
    bookings: bookingCounts[type]
  }));
};

router.get('/dashboard/test', asyncHandler(async (req, res) => {
  console.log('Fetching test dashboard data...');
  
  const [rooms, bookings, users, services] = await Promise.all([
    Room.find().populate('type'),
    Booking.find().populate('room').populate('user').sort({ createdAt: -1 }),
    User.find(),
    Service.find().sort({ createdAt: -1 })
  ]);
  
  const rawCounts = {
    roomsCount: rooms.length,
    bookingsCount: bookings.length,
    usersCount: users.length
  };
  
  const testData = {
    rawCounts,
    roomsArray: rooms.map(room => ({
      id: room._id.toString(),
      roomNumber: room.roomNumber,
      status: room.status,
      typeId: room.type?._id?.toString() || null
    })),
    bookingsArray: bookings.slice(0, 3).map(booking => ({
      id: booking._id.toString(),
      status: booking.status,
      roomId: booking.room?._id?.toString() || null
    })),
    usersArray: users.slice(0, 3).map(user => ({
      id: user._id.toString(),
      role: user.role,
      isActive: user.isActive
    }))
  };
  
  return res.status(HTTP_STATUS.OK).json(testData);
}));

module.exports = router;
