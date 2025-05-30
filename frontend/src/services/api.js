import axios from 'axios';
import { API_ENDPOINTS, HTTP_STATUS } from '../constants';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Add better error details for debugging
    if (error.response) {
      // Get the error response data
      const errorData = error.response.data;
      const errorStatus = error.response.status;
      
      // Log error details for debugging (can be disabled in production)
      if (process.env.NODE_ENV !== 'production') {
        console.error(`API Error [${errorStatus}]:`, errorData);
      }
      
      // Handle common errors
      switch (errorStatus) {
        case HTTP_STATUS.UNAUTHORIZED:
          // Unauthorized - clear token and redirect to login
          // Only redirect if not already on login/register page to avoid redirect loops
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
            localStorage.removeItem('token');
            // Use a timeout to allow the current execution to complete
            setTimeout(() => {
              window.location.href = '/login?session=expired';
            }, 100);
          }
          break;
          
        case HTTP_STATUS.FORBIDDEN:
          // Forbidden - user doesn't have permission
          console.error('Access denied: You do not have permission to perform this action');
          break;
          
        case HTTP_STATUS.NOT_FOUND:
          // Not found
          console.error('Resource not found');
          break;
          
        case HTTP_STATUS.UNPROCESSABLE_ENTITY:
          // Validation error
          console.error('Validation error:', errorData.errors || errorData.message);
          break;
          
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          // Server error
          console.error('Server error. Please try again later or contact support.');
          break;
          
        default:
          // Other errors
          console.error(`Error (${errorStatus}):`); 
      }
      
      // Return specific error message from server if available
      // Format the error in a consistent way for the application
      if (errorData) {
        const errorMessage = errorData.message || 
                            (typeof errorData === 'string' ? errorData : 'Unknown error occurred');
                            
        const errorDetails = errorData.errors || {};
        
        return Promise.reject({
          ...error,
          status: errorStatus,
          message: errorMessage,
          details: errorDetails,
          timestamp: new Date()
        });
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error: No response received from server. Please check your connection.');
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your connection and try again.',
        isNetworkError: true,
        timestamp: new Date()
      });
    } else {
      // Something happened in setting up the request
      console.error('Error Message:', error.message);
      return Promise.reject({
        ...error,
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date()
      });
    }
    return Promise.reject(error);
  }
);

// Helper function to handle FormData
const createFormData = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    if (key === 'images' || key === 'image') {
      // Handle file uploads
      if (Array.isArray(data[key])) {
        // For multiple files
        data[key].forEach((file, index) => {
          if (file instanceof File) {
            formData.append(`${key}`, file); // Use the plural name for multiple files
          } else if (file && file.file instanceof File) {
            // Handle objects that contain File objects (e.g. from image preview)
            formData.append(`${key}`, file.file);
          }
        });
      } else if (data[key] instanceof File) {
        // For single file
        formData.append(key, data[key]);
      } else if (typeof data[key] === 'string' && data[key].trim() !== '') {
        // For file paths as strings
        formData.append(key, data[key]);
      }
    } else if (key === 'amenities' && Array.isArray(data[key])) {
      // Join array values with comma for backend processing
      formData.append('amenities', data[key].join(','));
    } else {
      // For all other fields
      formData.append(key, data[key]);
    }
  });
  
  // Log form data contents for debugging
  console.log('Form data built:', Object.fromEntries(formData.entries()));
  
  return formData;
};

// Auth Services
export const authAPI = {
  register: (userData) => api.post(API_ENDPOINTS.AUTH.REGISTER, userData),
  login: (credentials) => api.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
  getCurrentUser: () => api.get(API_ENDPOINTS.AUTH.USER)
};

// Room Services
export const roomAPI = {
  getAllRooms: () => api.get(API_ENDPOINTS.ROOMS.BASE),
  getRoomById: (id) => api.get(`${API_ENDPOINTS.ROOMS.BASE}/${id}`),
  getAvailableRooms: (checkIn, checkOut) => api.get(`${API_ENDPOINTS.ROOMS.AVAILABLE}?checkIn=${checkIn}&checkOut=${checkOut}`),
  getFeaturedRooms: () => api.get(API_ENDPOINTS.ROOMS.FEATURED),
  getRoomTypes: () => api.get(API_ENDPOINTS.ROOMS.TYPES),
  createRoom: (roomData) => {
    // If roomData contains files, use FormData
    if (roomData.images && (Array.isArray(roomData.images) || roomData.images instanceof File)) {
      const formData = createFormData(roomData);
      
      return api.post(API_ENDPOINTS.ROOMS.BASE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    
    // Otherwise use regular JSON
    return api.post(API_ENDPOINTS.ROOMS.BASE, roomData);
  },
  updateRoom: (id, roomData) => {
    // If roomData contains files, use FormData
    if (roomData.images && (Array.isArray(roomData.images) || roomData.images instanceof File)) {
      const formData = createFormData(roomData);
      
      return api.put(`${API_ENDPOINTS.ROOMS.BASE}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    
    // Otherwise use regular JSON
    return api.put(`${API_ENDPOINTS.ROOMS.BASE}/${id}`, roomData);
  },
  deleteRoom: (id) => api.delete(`${API_ENDPOINTS.ROOMS.BASE}/${id}`)
};

// Booking Services
export const bookingAPI = {
  getAllBookings: () => api.get(API_ENDPOINTS.BOOKINGS.BASE),
  getBookingById: (id) => api.get(`${API_ENDPOINTS.BOOKINGS.BASE}/${id}`),
  getUserBookings: () => api.get(API_ENDPOINTS.BOOKINGS.USER),
  getRoomBookings: (roomId) => api.get(`${API_ENDPOINTS.BOOKINGS.BY_ROOM}/${roomId}`),
  getBookingsByPhone: (phoneNumber) => api.get(`${API_ENDPOINTS.BOOKINGS.BY_PHONE}/${phoneNumber}`),
  createBooking: (bookingData) => api.post(API_ENDPOINTS.BOOKINGS.BASE, bookingData),
  createGuestBooking: (bookingData) => api.post(API_ENDPOINTS.BOOKINGS.GUEST, { 
    roomId: bookingData.roomId, 
    checkInDate: bookingData.checkInDate,
    checkOutDate: bookingData.checkOutDate,
    adults: bookingData.adults,
    children: bookingData.children,
    specialRequests: bookingData.specialRequests,
    guestInfo: {
      name: bookingData.guestName,
      email: bookingData.guestEmail,
      phone: bookingData.guestPhone,
      address: bookingData.guestAddress
    }
  }),
  updateBooking: (id, bookingData) => api.put(`${API_ENDPOINTS.BOOKINGS.BASE}/${id}`, bookingData),
  updateBookingStatus: (id, statusData) => api.put(`${API_ENDPOINTS.BOOKINGS.STATUS}/${id}/status`, statusData),
  updateBookingPayment: (id, paymentData) => api.put(`${API_ENDPOINTS.BOOKINGS.PAYMENT}/${id}/payment`, paymentData),
  cancelBooking: (id) => api.put(`${API_ENDPOINTS.BOOKINGS.CANCEL}/${id}/cancel`),
  deleteBooking: (id) => api.delete(`${API_ENDPOINTS.BOOKINGS.BASE}/${id}`)
};

// User Services
export const userAPI = {
  getAllUsers: () => api.get(API_ENDPOINTS.USERS.BASE),
  getUserById: (id) => api.get(`${API_ENDPOINTS.USERS.BASE}/${id}`),
  createAdmin: (userData) => api.post(API_ENDPOINTS.USERS.ADMIN, userData),
  updateUser: (id, userData) => api.put(`${API_ENDPOINTS.USERS.BASE}/${id}`, userData),
  deleteUser: (id) => api.delete(`${API_ENDPOINTS.USERS.BASE}/${id}`)
};

// Service Services
export const serviceAPI = {
  getAllServices: () => api.get(API_ENDPOINTS.SERVICES.BASE),
  getServiceById: (id) => api.get(`${API_ENDPOINTS.SERVICES.BASE}/${id}`),
  getServicesByCategory: (category) => api.get(`${API_ENDPOINTS.SERVICES.CATEGORY}/${category}`),
  getFeatures: () => api.get(API_ENDPOINTS.SERVICES.FEATURES),
  createService: (serviceData) => {
    // If serviceData contains image file, use FormData
    if (serviceData.image && serviceData.image instanceof File) {
      const formData = createFormData(serviceData);
      
      return api.post(API_ENDPOINTS.SERVICES.BASE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    
    return api.post(API_ENDPOINTS.SERVICES.BASE, serviceData);
  },
  updateService: (id, serviceData) => {
    // If serviceData contains image file, use FormData
    if (serviceData.image && serviceData.image instanceof File) {
      const formData = createFormData(serviceData);
      
      return api.put(`${API_ENDPOINTS.SERVICES.BASE}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    
    return api.put(`${API_ENDPOINTS.SERVICES.BASE}/${id}`, serviceData);
  },
  deleteService: (id) => api.delete(`${API_ENDPOINTS.SERVICES.BASE}/${id}`),
  
  // Feature management
  createFeature: (featureData) => api.post(API_ENDPOINTS.SERVICES.FEATURES, featureData),
  updateFeature: (id, featureData) => api.put(`${API_ENDPOINTS.SERVICES.FEATURES}/${id}`, featureData),
  deleteFeature: (id) => api.delete(`${API_ENDPOINTS.SERVICES.FEATURES}/${id}`)
};

// Promotion Services
export const promotionAPI = {
  getAllPromotions: () => api.get(API_ENDPOINTS.PROMOTIONS.BASE),
  getPromotionById: (id) => api.get(`${API_ENDPOINTS.PROMOTIONS.BASE}/${id}`),
  createPromotion: (promotionData) => {
    // If promotionData contains image file, use FormData
    if (promotionData.image && promotionData.image instanceof File) {
      const formData = createFormData(promotionData);
      
      return api.post(API_ENDPOINTS.PROMOTIONS.BASE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    
    return api.post(API_ENDPOINTS.PROMOTIONS.BASE, promotionData);
  },
  updatePromotion: (id, promotionData) => {
    // If promotionData contains image file, use FormData
    if (promotionData.image && promotionData.image instanceof File) {
      const formData = createFormData(promotionData);
      
      return api.put(`${API_ENDPOINTS.PROMOTIONS.BASE}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    
    return api.put(`${API_ENDPOINTS.PROMOTIONS.BASE}/${id}`, promotionData);
  },
  deletePromotion: (id) => api.delete(`${API_ENDPOINTS.PROMOTIONS.BASE}/${id}`)
};

// Admin Services
export const adminAPI = {
  getDashboard: () => api.get(API_ENDPOINTS.ADMIN.DASHBOARD),
  getActivities: () => api.get(API_ENDPOINTS.ADMIN.ACTIVITIES),
  getReports: (startDate, endDate) => api.get(API_ENDPOINTS.ADMIN.REPORTS, {
    params: { startDate, endDate }
  })
};

// Staff Services
export const staffAPI = {
  // Bookings
  getStaffBookings: () => api.get(API_ENDPOINTS.STAFF.BOOKINGS),
  updateBookingCheckIn: (id, data) => api.put(`${API_ENDPOINTS.STAFF.BOOKINGS}/${id}/check-in`, data),
  updateBookingCheckOut: (id, data) => api.put(`${API_ENDPOINTS.STAFF.BOOKINGS}/${id}/check-out`, data),
  updateBooking: (id, data) => api.put(`${API_ENDPOINTS.STAFF.BOOKINGS}/${id}`, data),
  
  // Schedule
  getStaffSchedule: () => api.get(API_ENDPOINTS.STAFF.SCHEDULE),
  updateScheduleItem: (type, id, data) => api.put(`${API_ENDPOINTS.STAFF.SCHEDULE}/${type}/${id}`, data),
  
  // Rooms
  getStaffRooms: () => api.get(API_ENDPOINTS.STAFF.ROOMS),
  updateStaffRoom: (id, data) => api.put(`${API_ENDPOINTS.STAFF.ROOMS}/${id}`, data),
  updateRoomStatus: (id, statusData) => api.post(`${API_ENDPOINTS.STAFF.ROOMS}/${id}/status`, statusData),
  
  // Guest Services
  getGuestRequests: () => api.get(API_ENDPOINTS.STAFF.SERVICES),
  updateGuestRequest: (id, data) => api.put(`${API_ENDPOINTS.STAFF.SERVICES}/${id}`, data),
  createGuestRequest: (data) => api.post(API_ENDPOINTS.STAFF.SERVICES, data),
  completeGuestRequest: (id) => api.post(`${API_ENDPOINTS.STAFF.SERVICES}/${id}/complete`),
  
  // Guests
  getStaffGuests: () => api.get(API_ENDPOINTS.STAFF.GUESTS),
  
  // Dashboard
  getStaffDashboard: () => api.get(API_ENDPOINTS.STAFF.DASHBOARD),
  getStaffActivities: () => api.get(API_ENDPOINTS.STAFF.ACTIVITIES)
};

// Task Services
export const taskAPI = {
  getAllTasks: () => api.get(API_ENDPOINTS.TASKS.BASE),
  getTaskById: (id) => api.get(`${API_ENDPOINTS.TASKS.BASE}/${id}`),
  getTaskStats: () => api.get(`${API_ENDPOINTS.TASKS.BASE}/stats`),
  createTask: (taskData) => api.post(API_ENDPOINTS.TASKS.BASE, taskData),
  updateTask: (id, taskData) => api.put(`${API_ENDPOINTS.TASKS.BASE}/${id}`, taskData),
  deleteTask: (id) => api.delete(`${API_ENDPOINTS.TASKS.BASE}/${id}`)
};

export default api;