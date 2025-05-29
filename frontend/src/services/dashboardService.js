// eslint-disable-next-line no-unused-vars
import { roomAPI, bookingAPI, userAPI } from './api';
import { adminAPI, staffAPI } from './api';

/**
 * Service lấy và xử lý dữ liệu dashboard cho cả Admin và Staff
 */
class DashboardService {
  /**
   * Lấy dữ liệu thống kê tổng quan (chung cho cả Admin và Staff)
   * @param {string} role - Vai trò (admin hoặc staff)
   * @returns {Promise<Object>} - Dữ liệu thống kê
   */
  async getStats(role = 'admin') {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Use centralized API service for dashboard data
      const response = role === 'admin' 
        ? await adminAPI.getDashboard()
        : await staffAPI.getStaffDashboard();
      
      // Return data from the API with additional processing if needed
      const dashboardData = response.data;
      
      // Debug data from API
      console.log('Dashboard API response:', dashboardData);
      
      // Force convert nested objects into proper number values to ensure correct display
      if (dashboardData.rooms) {
        dashboardData.rooms.total = Number(dashboardData.rooms.total) || 0;
        dashboardData.rooms.available = Number(dashboardData.rooms.available) || 0;
        dashboardData.rooms.booked = Number(dashboardData.rooms.booked) || 0;
        dashboardData.rooms.maintenance = Number(dashboardData.rooms.maintenance) || 0;
      }
      
      if (dashboardData.bookings) {
        dashboardData.bookings.total = Number(dashboardData.bookings.total) || 0;
        dashboardData.bookings.pending = Number(dashboardData.bookings.pending) || 0;
        dashboardData.bookings.confirmed = Number(dashboardData.bookings.confirmed) || 0;
        dashboardData.bookings.checkedIn = Number(dashboardData.bookings.checkedIn) || 0;
        dashboardData.bookings.cancelled = Number(dashboardData.bookings.cancelled) || 0;
      }
      
      if (dashboardData.users) {
        dashboardData.users.total = Number(dashboardData.users.total) || 0;
        dashboardData.users.active = Number(dashboardData.users.active) || 0;
        dashboardData.users.inactive = Number(dashboardData.users.inactive) || 0;
      }
      
      // Process revenue values
      if (dashboardData.revenue) {
        dashboardData.revenue.today = Number(dashboardData.revenue.today) || 0;
        dashboardData.revenue.thisWeek = Number(dashboardData.revenue.thisWeek) || 0;
        dashboardData.revenue.thisMonth = Number(dashboardData.revenue.thisMonth) || 0;
      }
      
      // Process any null or undefined values that might cause rendering issues
      this._ensureValidData(dashboardData);
      
      console.log('Processed dashboard data:', dashboardData);
      
      return dashboardData;
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      // Return default data structure to prevent UI crashes
      return {
        rooms: { total: 0, available: 0, booked: 0, maintenance: 0 },
        bookings: { total: 0, pending: 0, confirmed: 0, checkedIn: 0, cancelled: 0 },
        users: { total: 0, active: 0, inactive: 0 },
        revenue: { today: 0, thisWeek: 0, thisMonth: 0 },
        bookingsData: [],
        totalRooms: 0,
        availableRooms: 0,
        todayBookings: 0,
        activeGuests: 0,
        roomsData: [],
        tasks: { total: 0, rooms: 0, services: 0 }
      };
    }
  }

  /**
   * Lấy các hoạt động gần đây (chung cho cả Admin và Staff)
   * @param {string} role - Vai trò (admin hoặc staff)
   * @returns {Promise<Array>} - Mảng các hoạt động
   */
  async getRecentActivities(role = 'admin') {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = role === 'admin' 
        ? await adminAPI.getActivities()
        : await staffAPI.getStaffActivities();
      
      return response.data || [];
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return [];
    }
  }
  
  /**
   * Private method to ensure all data values are valid and won't cause rendering issues
   * @param {Object} data - Dashboard data object
   * @private
   */
  _ensureValidData(data) {
    // Ensure all nested objects exist
    data.rooms = data.rooms || { total: 0, available: 0, booked: 0, maintenance: 0 };
    data.bookings = data.bookings || { total: 0, pending: 0, confirmed: 0, checkedIn: 0, cancelled: 0 };
    data.users = data.users || { total: 0, active: 0, inactive: 0 };
    data.revenue = data.revenue || { today: 0, thisWeek: 0, thisMonth: 0 };
    data.tasks = data.tasks || { total: 0, rooms: 0, services: 0 };
    
    // Ensure arrays exist
    data.bookingsData = data.bookingsData || [];
    data.roomsData = data.roomsData || [];
    
    // Replace any null/undefined values with appropriate defaults
    Object.keys(data.rooms).forEach(key => {
      data.rooms[key] = data.rooms[key] === null || data.rooms[key] === undefined ? 0 : data.rooms[key];
    });
    
    Object.keys(data.bookings).forEach(key => {
      data.bookings[key] = data.bookings[key] === null || data.bookings[key] === undefined ? 0 : data.bookings[key];
    });
    
    Object.keys(data.revenue).forEach(key => {
      data.revenue[key] = data.revenue[key] === null || data.revenue[key] === undefined ? 0 : data.revenue[key];
    });
    
    // Handle staff-specific fields
    if (data.totalRooms !== undefined) {
      data.totalRooms = data.totalRooms || 0;
      data.availableRooms = data.availableRooms || 0;
      data.todayBookings = data.todayBookings || 0;
      data.activeGuests = data.activeGuests || 0;
    }
  }
}

// Create and export a single instance
const dashboardServiceInstance = new DashboardService();
export default dashboardServiceInstance; 