#!/usr/bin/env node

const axios = require('axios');

async function simpleTest() {
  console.log('🧪 Simple Integration Test\n');
  
  try {
    // Test API
    console.log('Testing API...');
    const apiResponse = await axios.get('http://localhost:5000/api/rooms');
    console.log(`✅ API Status: ${apiResponse.status}`);
    console.log(`✅ API Format: ${apiResponse.data.success ? 'Standardized' : 'Legacy'}`);
    
    // Test Frontend
    console.log('\nTesting Frontend...');
    const frontendResponse = await axios.get('http://localhost:3000');
    console.log(`✅ Frontend Status: ${frontendResponse.status}`);
    
    console.log('\n🎉 Basic integration test passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

simpleTest();
