const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');

// @route   GET api/admin/dashboard
// @desc    Get dashboard data for admin
// @access  Private (Admin only)
router.get('/dashboard', [auth, admin], async (req, res) => {
  try {
    console.log('Fetching admin dashboard data...');
    
    // Get all data needed for the dashboard with proper population
    const [rooms, bookings, users, services] = await Promise.all([
      Room.find().populate('type'),
      Booking.find().populate('room').populate('user').sort({ createdAt: -1 }),
      User.find(),
      Service.find().sort({ createdAt: -1 })
    ]);
    
    // Debug room data
    console.log('Room data sample:', rooms.length > 0 ? {
      firstRoom: {
        id: rooms[0]._id,
        roomNumber: rooms[0].roomNumber,
        type: rooms[0].type,
        status: rooms[0].status
      },
      count: rooms.length,
      types: rooms.map(room => typeof room)
    } : 'No rooms found');
    
    console.log(`Found: ${rooms.length} rooms, ${bookings.length} bookings, ${users.length} users, ${services.length} services`);
    
    if (rooms.length === 0 && bookings.length === 0 && users.length === 0) {
      console.log('No data found in database');
    }
    
    // Calculate date ranges for revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
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
    // Make sure we have an array of rooms
    if (!Array.isArray(rooms)) {
      console.error('Expected rooms to be an array, got:', typeof rooms);
      rooms = [];
    }
    
    console.log('Room statuses:', rooms.map(room => room.status));
    
    const availableRooms = rooms.filter(room => 
      room.status === 'available' || room.status === 'vacant-clean').length;
    
    const bookedRooms = rooms.filter(room => 
      room.status === 'booked' || room.status === 'occupied').length;
    
    const maintenanceRooms = rooms.filter(room => 
      room.status === 'maintenance').length;
      
    console.log('Calculated room counts:', {
      total: rooms.length,
      available: availableRooms,
      booked: bookedRooms,
      maintenance: maintenanceRooms
    });
    
    // Count booking status
    const pendingBookings = bookings.filter(booking => 
      booking.status === 'pending').length;
    
    const confirmedBookings = bookings.filter(booking => 
      booking.status === 'confirmed').length;
    
    const checkedInBookings = bookings.filter(booking => 
      booking.status === 'checked-in').length;
    
    const cancelledBookings = bookings.filter(booking => 
      booking.status === 'cancelled').length;
    
    console.log('Room counts:', {
      total: rooms.length,
      available: availableRooms,
      booked: bookedRooms,
      maintenance: maintenanceRooms
    });
    
    console.log('Booking counts:', {
      total: bookings.length,
      pending: pendingBookings,
      confirmed: confirmedBookings,
      checkedIn: checkedInBookings,
      cancelled: cancelledBookings
    });
    
    // Format response data with FORCED explicit Number conversion to ensure proper data types
    const roomsTotal = Number(rooms.length || 0);
    const roomsAvailable = Number(availableRooms || 0);
    const roomsBooked = Number(bookedRooms || 0);
    const roomsMaintenance = Number(maintenanceRooms || 0);
    
    const bookingsTotal = Number(bookings.length || 0);
    const bookingsPending = Number(pendingBookings || 0);
    const bookingsConfirmed = Number(confirmedBookings || 0);
    const bookingsCheckedIn = Number(checkedInBookings || 0);
    const bookingsCancelled = Number(cancelledBookings || 0);
    
    console.log('Explicit number conversions:', {
      roomsTotal, 
      roomsAvailable, 
      roomsBooked, 
      roomsMaintenance,
      bookingsTotal,
      bookingsPending,
      bookingsConfirmed,
      bookingsCheckedIn
    });
    
    const dashboardData = {
      rooms: {
        total: roomsTotal,
        available: roomsAvailable,
        booked: roomsBooked,
        maintenance: roomsMaintenance
      },
      bookings: {
        total: bookingsTotal,
        pending: bookingsPending,
        confirmed: bookingsConfirmed,
        checkedIn: bookingsCheckedIn,
        cancelled: bookingsCancelled
      },
      users: {
        total: Number(users.length || 0),
        active: Number(users.filter(user => user.isActive).length || 0),
        inactive: Number(users.filter(user => !user.isActive).length || 0),
        staff: Number(users.filter(user => user.role === 'staff').length || 0),
        customers: Number(users.filter(user => user.role === 'user').length || 0)
      },
      revenue: {
        today: Number(todayRevenue || 0),
        thisWeek: Number(weekRevenue || 0),
        thisMonth: Number(monthRevenue || 0)
      },
      // Recent bookings for display
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
      // Statistics for last 30 days
      statistics: {
        newUsers: users.filter(user => {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return new Date(user.createdAt) >= thirtyDaysAgo;
        }).length,
        completedBookings: bookings.filter(booking => {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return booking.status === 'checked-out' && new Date(booking.checkOutDate) >= thirtyDaysAgo;
        }).length,
        serviceRequests: services.filter(service => {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return new Date(service.createdAt) >= thirtyDaysAgo;
        }).length
      }
    };
    
    console.log('Admin dashboard data prepared successfully');
    return res.json(dashboardData);
  } catch (err) {
    console.error('Error fetching admin dashboard data:', err.message);
    res.status(500).json({ 
      message: 'Server error retrieving dashboard data',
      error: err.message 
    });
  }
});

// @route   GET api/admin/activities
// @desc    Get recent activities for admin
// @access  Private (Admin only)
router.get('/activities', [auth, admin], async (req, res) => {
  try {
    // In a real implementation, you would fetch recent activities from a dedicated collection
    // For now, return an empty array
    res.json([]);
  } catch (err) {
    console.error('Error fetching admin activities:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/reports
// @desc    Get report data for admin
// @access  Private (Admin only)
router.get('/reports', [auth, admin], async (req, res) => {
  try {
    console.log('Fetching admin report data...');
    
    // Get start and end dates from query or use default (1 month)
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();
    
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    console.log(`Report period: ${start.toISOString()} to ${end.toISOString()}`);
    
    // Get all data needed for the reports
    const [rooms, bookings, users] = await Promise.all([
      Room.find().populate('type'),
      Booking.find({
        createdAt: { $gte: start, $lte: end }
      }).populate('room').populate('user').sort({ createdAt: -1 }),
      User.find()
    ]);
    
    console.log(`Found: ${rooms.length} rooms, ${bookings.length} bookings, ${users.length} users`);
    
    // Calculate revenue metrics
    const totalRevenue = bookings.reduce((sum, booking) => {
      if (booking.status !== 'cancelled') {
        return sum + (booking.totalPrice || 0);
      }
      return sum;
    }, 0);
    
    // Calculate booking metrics
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(booking => 
      booking.status === 'checked-out').length;
    const cancelledBookings = bookings.filter(booking => 
      booking.status === 'cancelled').length;
    
    // Calculate guest metrics
    const totalGuests = bookings.reduce((sum, booking) => {
      const adults = booking.numberOfGuests?.adults || 1;
      const children = booking.numberOfGuests?.children || 0;
      return sum + adults + children;
    }, 0);
    
    // Calculate occupancy rate
    const occupiedRooms = rooms.filter(room => 
      room.status === 'occupied' || room.status === 'booked').length;
    const occupancyRate = Math.round((occupiedRooms / (rooms.length || 1)) * 100);
    
    // Group revenue by month for the last 12 months
    const revenueByMonth = calculateRevenueByMonth(bookings);
    
    // Group bookings by room type
    const bookingsByRoomType = calculateBookingsByRoomType(bookings, rooms);
    
    // Format response data
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
    return res.json(reportData);
  } catch (err) {
    console.error('Error fetching admin report data:', err.message);
    res.status(500).json({ 
      message: 'Server error retrieving report data',
      error: err.message 
    });
  }
});

// Helper function to calculate revenue by month
const calculateRevenueByMonth = (bookings) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const revenueByMonth = Array(12).fill(0);
  
  bookings.forEach(booking => {
    if (booking.status !== 'cancelled' && booking.createdAt) {
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

// Helper function to calculate bookings by room type
const calculateBookingsByRoomType = (bookings, rooms) => {
  // Create a map of room IDs to room types
  const roomTypesMap = {};
  rooms.forEach(room => {
    if (room.type && typeof room.type === 'object') {
      roomTypesMap[room._id] = room.type.name || 'Unknown';
    } else {
      roomTypesMap[room._id] = 'Unknown';
    }
  });
  
  // Count bookings by room type
  const bookingCounts = {};
  
  bookings.forEach(booking => {
    if (booking.room) {
      let roomId = booking.room;
      
      // Handle if room is populated
      if (typeof booking.room === 'object' && booking.room._id) {
        roomId = booking.room._id;
      }
      
      const roomType = roomTypesMap[roomId] || 'Unknown';
      bookingCounts[roomType] = (bookingCounts[roomType] || 0) + 1;
    }
  });
  
  // Convert to array format needed for chart
  return Object.keys(bookingCounts).map(type => ({
    type,
    bookings: bookingCounts[type]
  }));
};

// @route   GET api/admin/dashboard/test
// @desc    Test endpoint for dashboard data
// @access  Public (for testing)
router.get('/dashboard/test', async (req, res) => {
  try {
    console.log('Fetching test dashboard data...');
    
    // Get all data needed for the dashboard with proper population
    const [rooms, bookings, users, services] = await Promise.all([
      Room.find().populate('type'),
      Booking.find().populate('room').populate('user').sort({ createdAt: -1 }),
      User.find(),
      Service.find().sort({ createdAt: -1 })
    ]);
    
    // Raw counts
    const rawCounts = {
      roomsCount: rooms.length,
      bookingsCount: bookings.length,
      usersCount: users.length
    };
    
    // Format basic response data
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
    
    return res.json(testData);
  } catch (err) {
    console.error('Error fetching test dashboard data:', err.message);
    res.status(500).json({ 
      message: 'Server error retrieving test dashboard data',
      error: err.message 
    });
  }
});

module.exports = router; 