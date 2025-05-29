#!/usr/bin/env node

/**
 * End-to-End Integration Test for Hotel Management System
 * Tests both API consistency and frontend-backend integration
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const FRONTEND_BASE = 'http://localhost:3000';

// Test configuration
const tests = {
  // Public API endpoints that should be standardized
  publicEndpoints: [
    { name: 'Rooms', path: '/rooms' },
    { name: 'Room Types', path: '/rooms/types' },
    { name: 'Services', path: '/services' },
    { name: 'Services Features', path: '/services/features' },
    { name: 'Promotions', path: '/promotions' },
    { name: 'All Promotions', path: '/promotions/all' }
  ],
  
  // Protected endpoints (should return 401 without auth)
  protectedEndpoints: [
    { name: 'Admin Dashboard', path: '/admin/dashboard' },
    { name: 'Staff Dashboard', path: '/staff/dashboard' },
    { name: 'Staff Rooms', path: '/staff/rooms' },
    { name: 'Staff Bookings', path: '/staff/bookings' }
  ]
};

/**
 * Check if response follows the standardized format
 */
function isStandardFormat(response) {
  return (
    response.data &&
    typeof response.data === 'object' &&
    response.data.success === true &&
    response.data.hasOwnProperty('data')
  );
}

/**
 * Test API endpoint consistency
 */
async function testAPIConsistency() {
  console.log('🧪 Testing API Consistency...\n');
  
  let passed = 0;
  let total = 0;
  
  // Test public endpoints
  console.log('📋 Testing Public Endpoints:');
  for (const endpoint of tests.publicEndpoints) {
    total++;
    try {
      const response = await axios.get(`${API_BASE}${endpoint.path}`, {
        timeout: 5000
      });
      
      if (response.status === 200 && isStandardFormat(response)) {
        console.log(`✅ ${endpoint.name}: OK (${response.status})`);
        console.log(`   ✅ Format: Standardized { success: true, data: [...] }`);
        
        // Log data count if it's an array
        if (Array.isArray(response.data.data)) {
          console.log(`   Count: ${response.data.data.length} items`);
        }
        passed++;
      } else {
        console.log(`❌ ${endpoint.name}: Inconsistent format`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Format: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Error - ${error.message}`);
    }
    console.log('');
  }
  
  // Test protected endpoints (should return 401)
  console.log('🔒 Testing Protected Endpoints (should return 401):');
  for (const endpoint of tests.protectedEndpoints) {
    try {
      const response = await axios.get(`${API_BASE}${endpoint.path}`, {
        timeout: 5000
      });
      console.log(`❌ ${endpoint.name}: Should be protected but returned ${response.status}`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log(`✅ ${endpoint.name}: Correctly protected (401)`);
      } else {
        console.log(`❌ ${endpoint.name}: Unexpected error - ${error.message}`);
      }
    }
  }
  
  console.log(`\n📊 Summary: ${passed}/${total} public endpoints consistent\n`);
  
  if (passed === total) {
    console.log('🎉 All API endpoints have consistent response format!\n');
    return true;
  } else {
    console.log('❌ Some endpoints need standardization\n');
    return false;
  }
}

/**
 * Test frontend accessibility
 */
async function testFrontendAccessibility() {
  console.log('🌐 Testing Frontend Accessibility...\n');
  
  try {
    const response = await axios.get(FRONTEND_BASE, {
      timeout: 10000,
      headers: {
        'Accept': 'text/html'
      }
    });
    
    if (response.status === 200) {
      console.log('✅ Frontend is accessible');
      console.log(`   Status: ${response.status}`);
      console.log(`   Content-Type: ${response.headers['content-type']}`);
      return true;
    } else {
      console.log(`❌ Frontend returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Frontend not accessible: ${error.message}`);
    return false;
  }
}

/**
 * Test sample data flow
 */
async function testDataFlow() {
  console.log('🔄 Testing Data Flow Integration...\n');
  
  try {
    // Test rooms endpoint specifically since it's heavily used
    const roomsResponse = await axios.get(`${API_BASE}/rooms`);
    
    if (isStandardFormat(roomsResponse)) {
      console.log('✅ Rooms API returns standardized format');
      
      // Test if data structure is correct for frontend consumption
      const rooms = roomsResponse.data.data;
      if (Array.isArray(rooms)) {
        console.log(`✅ Rooms data is array with ${rooms.length} items`);
        
        if (rooms.length > 0) {
          const sampleRoom = rooms[0];
          const hasRequiredFields = ['id', 'room_number', 'type_id'].every(field => 
            sampleRoom.hasOwnProperty(field)
          );
          
          if (hasRequiredFields) {
            console.log('✅ Room objects have required fields');
          } else {
            console.log('❌ Room objects missing required fields');
            console.log(`   Sample room: ${JSON.stringify(sampleRoom)}`);
          }
        }
      } else {
        console.log('❌ Rooms data is not an array');
      }
      
      return true;
    } else {
      console.log('❌ Rooms API format not standardized');
      return false;
    }
  } catch (error) {
    console.log(`❌ Data flow test failed: ${error.message}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runIntegrationTests() {
  console.log('🚀 Hotel Management System - Integration Tests');
  console.log('================================================\n');
  
  const results = {};
  
  // Run all tests
  results.apiConsistency = await testAPIConsistency();
  results.frontendAccessibility = await testFrontendAccessibility();
  results.dataFlow = await testDataFlow();
  
  console.log('\n📈 Final Results:');
  console.log('================');
  console.log(`API Consistency: ${results.apiConsistency ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Frontend Access: ${results.frontendAccessibility ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Data Flow: ${results.dataFlow ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 All integration tests passed! The system is ready for use.');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Please check the issues above.');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runIntegrationTests().catch(error => {
    console.error('💥 Test runner failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runIntegrationTests,
  testAPIConsistency,
  testFrontendAccessibility,
  testDataFlow
};
