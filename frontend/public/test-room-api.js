import { roomAPI } from '../src/services/api.js';

// Test function to verify room API
async function testRoomAPI() {
  console.log('🧪 Testing Room API...');
  
  try {
    // Test getting a specific room
    const roomId = '682a31a6dd20bc68af5a9628';
    console.log(`📋 Testing getRoomById(${roomId})`);
    
    const response = await roomAPI.getRoomById(roomId);
    console.log('✅ API Response:', response.data);
    
    // Extract room data (handle both response formats)
    const roomData = response.data.data || response.data;
    console.log('✅ Room Data:', roomData);
    
    if (roomData && roomData._id) {
      console.log('✅ Room ID found:', roomData._id);
      console.log('✅ Room Number:', roomData.roomNumber);
      console.log('✅ Room Type:', roomData.type);
      console.log('✅ Room Price:', roomData.price);
      console.log('✅ Room Capacity:', roomData.capacity);
      console.log('✅ SUCCESS: Room API is working correctly!');
    } else {
      console.error('❌ FAILED: No room data found in response');
    }
    
  } catch (error) {
    console.error('❌ FAILED: Room API test failed:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      response: error.response?.data
    });
  }
}

// Export for use in browser console
window.testRoomAPI = testRoomAPI;
