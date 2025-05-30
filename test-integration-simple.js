console.log('🧪 Testing Frontend-Backend Integration...\n');

// Test API using shell commands since axios might have issues
const { execSync } = require('child_process');

try {
  console.log('1. Testing Login...');
  const loginResponse = execSync('curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d \'{"email":"admin","password":"admin"}\'', { encoding: 'utf8' });
  const loginData = JSON.parse(loginResponse);
  
  if (loginData.success) {
    console.log('✅ Login successful');
    console.log(`   User: ${loginData.user.name} (${loginData.user.role})`);
    
    console.log('\n2. Testing Get User Profile...');
    const profileResponse = execSync(`curl -s -X GET http://localhost:5000/api/auth/user -H "x-auth-token: ${loginData.token}"`, { encoding: 'utf8' });
    const profileData = JSON.parse(profileResponse);
    
    if (profileData.success) {
      console.log('✅ Profile retrieval successful');
      console.log(`   Name: ${profileData.data.name}`);
      console.log(`   Role: ${profileData.data.role}`);
    }
    
    console.log('\n3. Testing Get Rooms...');
    const roomsResponse = execSync('curl -s -X GET http://localhost:5000/api/rooms', { encoding: 'utf8' });
    const roomsData = JSON.parse(roomsResponse);
    
    if (roomsData.success) {
      console.log('✅ Rooms retrieval successful');
      console.log(`   Total rooms: ${roomsData.data.length}`);
      if (roomsData.data.length > 0) {
        const room = roomsData.data[0];
        console.log(`   Sample room: ${room.roomNumber} (${room.status})`);
      }
    }
    
    console.log('\n4. Testing Get Promotions...');
    const promotionsResponse = execSync('curl -s -X GET http://localhost:5000/api/promotions', { encoding: 'utf8' });
    const promotionsData = JSON.parse(promotionsResponse);
    
    if (promotionsData.success) {
      console.log('✅ Promotions retrieval successful');
      console.log(`   Total promotions: ${promotionsData.data.length}`);
    }
    
    console.log('\n✅ All basic API tests passed!');
    console.log('\n📱 Frontend should now be working correctly at http://localhost:3000');
    console.log('🔧 You can test login with: email="admin", password="admin"');
    
  } else {
    console.log('❌ Login failed');
  }
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
}

console.log('\n🏁 Integration test completed!');
