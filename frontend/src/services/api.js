import axios from 'axios';

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
        case 401:
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
          
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access denied: You do not have permission to perform this action');
          break;
          
        case 404:
          // Not found
          console.error('Resource not found');
          break;
          
        case 422:
          // Validation error
          console.error('Validation error:', errorData.errors || errorData.message);
          break;
          
        case 500:
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
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/user')
};

// Room Services
export const roomAPI = {
  getAllRooms: () => api.get('/rooms'),
  getRoomById: (id) => api.get(`/rooms/${id}`),
  getAvailableRooms: (checkIn, checkOut) => api.get(`/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}`),
  getRoomTypes: () => api.get('/rooms/types'),
  createRoom: (roomData) => {
    // If roomData contains files, use FormData
    if (roomData.images && (Array.isArray(roomData.images) || roomData.images instanceof File)) {
      const formData = createFormData(roomData);
      
      return axios.post(`${API_URL}/rooms`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': localStorage.getItem('token')
        }
      });
    }
    
    // Otherwise use regular JSON
    return api.post('/rooms', roomData);
  },
  updateRoom: (id, roomData) => {
    // If roomData contains files, use FormData
    if (roomData.images && (Array.isArray(roomData.images) || roomData.images instanceof File)) {
      const formData = createFormData(roomData);
      
      return axios.put(`${API_URL}/rooms/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': localStorage.getItem('token')
        }
      });
    }
    
    // Otherwise use regular JSON
    return api.put(`/rooms/${id}`, roomData);
  },
  deleteRoom: (id) => api.delete(`/rooms/${id}`)
};

// Booking Services
export const bookingAPI = {
  getAllBookings: () => api.get('/bookings'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  getUserBookings: () => api.get('/bookings/me'),
  getRoomBookings: (roomId) => api.get(`/bookings/room/${roomId}`),
  getBookingsByPhone: (phoneNumber) => api.get(`/bookings/phone/${phoneNumber}`),
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  createGuestBooking: (bookingData) => api.post('/bookings/guest', { 
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
  updateBooking: (id, bookingData) => api.put(`/bookings/${id}`, bookingData),
  updateBookingStatus: (id, statusData) => api.put(`/bookings/${id}/status`, statusData),
  deleteBooking: (id) => api.delete(`/bookings/${id}`)
};

// User Services
export const userAPI = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`)
};

// Service Services
export const serviceAPI = {
  getAllServices: () => api.get('/services'),
  getServiceById: (id) => api.get(`/services/${id}`),
  createService: (serviceData) => {
    // If serviceData contains image file, use FormData
    if (serviceData.image && serviceData.image instanceof File) {
      const formData = createFormData(serviceData);
      
      return axios.post(`${API_URL}/services`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': localStorage.getItem('token')
        }
      });
    }
    
    return api.post('/services', serviceData);
  },
  updateService: (id, serviceData) => {
    // If serviceData contains image file, use FormData
    if (serviceData.image && serviceData.image instanceof File) {
      const formData = createFormData(serviceData);
      
      return axios.put(`${API_URL}/services/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': localStorage.getItem('token')
        }
      });
    }
    
    return api.put(`/services/${id}`, serviceData);
  },
  deleteService: (id) => api.delete(`/services/${id}`)
};

// Promotion Services
export const promotionAPI = {
  getAllPromotions: () => api.get('/promotions'),
  getPromotionById: (id) => api.get(`/promotions/${id}`),
  createPromotion: (promotionData) => {
    // If promotionData contains image file, use FormData
    if (promotionData.image && promotionData.image instanceof File) {
      const formData = createFormData(promotionData);
      
      return axios.post(`${API_URL}/promotions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': localStorage.getItem('token')
        }
      });
    }
    
    return api.post('/promotions', promotionData);
  },
  updatePromotion: (id, promotionData) => {
    // If promotionData contains image file, use FormData
    if (promotionData.image && promotionData.image instanceof File) {
      const formData = createFormData(promotionData);
      
      return axios.put(`${API_URL}/promotions/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': localStorage.getItem('token')
        }
      });
    }
    
    return api.put(`/promotions/${id}`, promotionData);
  },
  deletePromotion: (id) => api.delete(`/promotions/${id}`)
};

// Admin Services
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getActivities: () => api.get('/admin/activities'),
  getReports: (startDate, endDate) => api.get('/admin/reports', {
    params: { startDate, endDate }
  })
};

export default api;