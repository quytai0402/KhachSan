const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPIEndpoints() {
  console.log('🧪 Testing API Consistency...\n');
  
  const endpoints = [
    { name: 'Rooms', url: '/rooms' },
    { name: 'Room Types', url: '/rooms/types' },
    { name: 'Promotions', url: '/promotions' },
    { name: 'Features', url: '/services/features' },
    { name: 'Services', url: '/services' },
  ];
  
  let passedTests = 0;
  let failedTests = 0;
  let totalTests = endpoints.length;
  const inconsistentEndpoints = [];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint.url}`);
      
      if (response.status === 200) {
        console.log(`✅ ${endpoint.name}: OK (${response.status})`);
        
        // Check for consistent format { success: true, data: [...] }
        if (response.data && response.data.success === true && response.data.data !== undefined) {
          console.log(`   ✅ Format: Standardized { success: true, data: [...] }`);
          console.log(`   Count: ${Array.isArray(response.data.data) ? response.data.data.length : '1'} items`);
          passedTests++;
        } else {
          console.log(`   ❌ Format: Non-standardized`);
          console.log(`   Expected: { success: true, data: [...] }`);
          console.log(`   Received: ${JSON.stringify(response.data).substring(0, 100)}...`);
          inconsistentEndpoints.push(endpoint.name);
          failedTests++;
        }
      } else {
        console.log(`❌ ${endpoint.name}: Failed (${response.status})`);
        failedTests++;
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Error - ${error.message}`);
      failedTests++;
    }
    console.log('');
  }
  
  console.log(`\n📊 Summary: ${passedTests}/${totalTests} endpoints consistent`);
  
  if (inconsistentEndpoints.length > 0) {
    console.log('\n⚠️  Inconsistent API endpoints:');
    inconsistentEndpoints.forEach(name => console.log(`   - ${name}`));
  }
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All API endpoints have consistent response format!');
  } else {
    console.log('\n⚠️  Some API endpoints have inconsistent response formats.');
  }
}

testAPIEndpoints().catch(console.error);
