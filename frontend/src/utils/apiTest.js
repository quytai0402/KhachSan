// API Test Utilities
import { authAPI, roomAPI, bookingAPI } from '../services/api';

export const testAPIConnections = async () => {
  const results = {};
  
  try {
    // Test 1: Basic API connectivity
    console.log('🔗 Testing API connectivity...');
    const roomsResponse = await roomAPI.getAllRooms();
    results.roomsAPI = {
      success: true,
      data: roomsResponse.data,
      message: `Found ${roomsResponse.data.data?.length || 0} rooms`
    };
    console.log('✅ Rooms API working');
  } catch (error) {
    results.roomsAPI = {
      success: false,
      error: error.message,
      details: error
    };
    console.error('❌ Rooms API failed:', error.message);
  }

  try {
    // Test 2: Login functionality
    console.log('🔐 Testing login...');
    const loginResponse = await authAPI.login({
      email: 'admin',
      password: 'admin'
    });
    
    if (loginResponse.data.token) {
      localStorage.setItem('token', loginResponse.data.token);
      
      // Test getting current user
      const userResponse = await authAPI.getCurrentUser();
      results.authAPI = {
        success: true,
        token: loginResponse.data.token,
        user: userResponse.data.data || userResponse.data,
        message: 'Login successful'
      };
      console.log('✅ Auth API working');
    }
  } catch (error) {
    results.authAPI = {
      success: false,
      error: error.message,
      details: error
    };
    console.error('❌ Auth API failed:', error.message);
  }

  try {
    // Test 3: Room availability
    console.log('📅 Testing room availability...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const availableRooms = await roomAPI.getAvailableRooms(
      today.toISOString().split('T')[0],
      tomorrow.toISOString().split('T')[0]
    );
    
    results.availabilityAPI = {
      success: true,
      data: availableRooms.data,
      message: `Found ${availableRooms.data?.length || 0} available rooms`
    };
    console.log('✅ Room availability API working');
  } catch (error) {
    results.availabilityAPI = {
      success: false,
      error: error.message,
      details: error
    };
    console.error('❌ Room availability API failed:', error.message);
  }

  return results;
};

export const debugAPIIssues = () => {
  console.group('🔍 API Debug Information');
  
  console.log('API Base URL:', process.env.REACT_APP_API_URL || 'http://localhost:5000/api');
  console.log('Current token:', localStorage.getItem('token') ? 'Present' : 'Missing');
  console.log('Network status:', navigator.onLine ? 'Online' : 'Offline');
  
  // Check for common issues
  const issues = [];
  
  if (!process.env.REACT_APP_API_URL && window.location.hostname !== 'localhost') {
    issues.push('⚠️ REACT_APP_API_URL not set for production');
  }
  
  if (!localStorage.getItem('token')) {
    issues.push('ℹ️ No authentication token found');
  }
  
  if (issues.length > 0) {
    console.group('Potential Issues:');
    issues.forEach(issue => console.log(issue));
    console.groupEnd();
  } else {
    console.log('✅ No obvious configuration issues detected');
  }
  
  console.groupEnd();
};

// Auto-run debug on import in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    debugAPIIssues();
  }, 1000);
}
