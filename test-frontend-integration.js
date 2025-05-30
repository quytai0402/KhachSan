const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testFrontendIntegration() {
  console.log('🧪 Testing Frontend-Backend Integration...\n');

  try {
    // Test 1: Login
    console.log('1. Testing Login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin',
      password: 'admin'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      console.log(`   Token: ${loginResponse.data.token.substring(0, 50)}...`);
      console.log(`   User: ${loginResponse.data.user.name} (${loginResponse.data.user.role})`);
      
      const token = loginResponse.data.token;

      // Test 2: Get User Profile
      console.log('\n2. Testing Get User Profile...');
      const profileResponse = await axios.get(`${API_URL}/auth/user`, {
        headers: { 'x-auth-token': token }
      });

      if (profileResponse.data.success) {
        console.log('✅ Profile retrieval successful');
        console.log(`   User ID: ${profileResponse.data.data._id}`);
        console.log(`   Name: ${profileResponse.data.data.name}`);
        console.log(`   Email: ${profileResponse.data.data.email}`);
        console.log(`   Role: ${profileResponse.data.data.role}`);
      }

      // Test 3: Get Rooms
      console.log('\n3. Testing Get Rooms...');
      const roomsResponse = await axios.get(`${API_URL}/rooms`);

      if (roomsResponse.data.success) {
        console.log('✅ Rooms retrieval successful');
        console.log(`   Total rooms: ${roomsResponse.data.data.length}`);
        if (roomsResponse.data.data.length > 0) {
          const room = roomsResponse.data.data[0];
          console.log(`   Sample room: ${room.roomNumber} (${room.status})`);
          console.log(`   Room type: ${room.type.name}`);
          console.log(`   Price: ${room.type.basePrice}`);
        }
      }

      // Test 4: Get Promotions
      console.log('\n4. Testing Get Promotions...');
      const promotionsResponse = await axios.get(`${API_URL}/promotions`);

      if (promotionsResponse.data.success) {
        console.log('✅ Promotions retrieval successful');
        console.log(`   Total promotions: ${promotionsResponse.data.data.length}`);
        if (promotionsResponse.data.data.length > 0) {
          const promo = promotionsResponse.data.data[0];
          console.log(`   Sample promotion: ${promo.name}`);
          console.log(`   Code: ${promo.code}`);
          console.log(`   Discount: ${promo.discountValue}${promo.discountType === 'percentage' ? '%' : ' VND'}`);
        }
      }

      // Test 5: Test Room Booking (Create booking)
      console.log('\n5. Testing Room Booking...');
      try {
        const bookingData = {
          roomId: roomsResponse.data.data[0]._id,
          checkInDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          checkOutDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
          guestInfo: {
            name: 'Test Guest',
            email: 'test@example.com',
            phone: '0123456789',
            idNumber: '123456789'
          },
          totalAmount: roomsResponse.data.data[0].type.basePrice
        };

        const bookingResponse = await axios.post(`${API_URL}/bookings`, bookingData, {
          headers: { 'x-auth-token': token }
        });

        if (bookingResponse.data.success) {
          console.log('✅ Room booking successful');
          console.log(`   Booking ID: ${bookingResponse.data.data._id}`);
          console.log(`   Status: ${bookingResponse.data.data.status}`);
        }
      } catch (bookingError) {
        console.log('❌ Room booking failed');
        console.log(`   Error: ${bookingError.response?.data?.message || bookingError.message}`);
      }

    } else {
      console.log('❌ Login failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }

  console.log('\n🏁 Integration test completed!');
}

testFrontendIntegration();
