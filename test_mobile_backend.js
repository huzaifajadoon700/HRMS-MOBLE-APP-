// Test script to verify mobile backend is working correctly
const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

async function testMobileBackend() {
  console.log('🧪 Testing Mobile Backend APIs...\n');

  const tests = [
    {
      name: 'Health Check',
      url: '/api/health',
      method: 'GET'
    },
    {
      name: 'Rooms API',
      url: '/api/rooms',
      method: 'GET'
    },
    {
      name: 'Tables API',
      url: '/api/tables',
      method: 'GET'
    },
    {
      name: 'Menus API',
      url: '/api/menus',
      method: 'GET'
    },
    {
      name: 'Popular Rooms',
      url: '/api/rooms/popular?count=3',
      method: 'GET'
    },
    {
      name: 'Popular Tables',
      url: '/api/tables/popular?limit=3',
      method: 'GET'
    },
    {
      name: 'Popular Food Items',
      url: '/api/food-recommendations/popular?count=3',
      method: 'GET'
    }
  ];

  const results = [];

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const response = await axios({
        method: test.method,
        url: `${BASE_URL}${test.url}`,
        timeout: 10000
      });

      const dataLength = Array.isArray(response.data) 
        ? response.data.length 
        : response.data?.popularRooms?.length ||
          response.data?.popularTables?.length ||
          response.data?.popularItems?.length ||
          'Data Available';

      results.push({
        name: test.name,
        status: response.status,
        success: true,
        dataLength: dataLength
      });

      console.log(`✅ ${test.name}: ${response.status} - Data: ${dataLength}`);
    } catch (error) {
      results.push({
        name: test.name,
        status: error.response?.status || 'ERROR',
        success: false,
        error: error.message
      });

      console.log(`❌ ${test.name}: ${error.response?.status || 'ERROR'} - ${error.message}`);
    }
  }

  console.log('\n📊 SUMMARY:');
  console.log('=' * 50);
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  if (successful === total) {
    console.log('\n🎉 All tests passed! Mobile backend is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.');
  }

  return results;
}

// Run the tests
testMobileBackend().catch(console.error);
