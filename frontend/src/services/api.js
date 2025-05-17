import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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
      console.error('API Error Response:', error.response.data);
      console.error('API Error Status:', error.response.status);
    } else if (error.request) {
      console.error('API Error Request:', error.request);
    } else {
      console.error('API Error Message:', error.message);
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
        data[key].forEach(file => {
          if (file instanceof File) {
            formData.append(key, file);
          }
        });
      } else if (data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (typeof data[key] === 'string' && data[key].trim() !== '') {
        formData.append(key, data[key]);
      }
    } else if (key === 'amenities' && Array.isArray(data[key])) {
      formData.append('amenities', data[key].join(','));
    } else {
      formData.append(key, data[key]);
    }
  });
  
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
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  updateBooking: (id, bookingData) => api.put(`/bookings/${id}`, bookingData),
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

export default api; 