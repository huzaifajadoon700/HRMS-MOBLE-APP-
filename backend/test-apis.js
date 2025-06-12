// Test script to verify all admin dashboard APIs are working
const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

// Test all dashboard APIs
async function testDashboardAPIs() {
  console.log('🧪 Testing Admin Dashboard APIs...\n');

  const endpoints = [
    { name: 'Rooms', url: '/api/rooms' },
    { name: 'Orders', url: '/api/orders' },
    { name: 'Menus', url: '/api/menus' },
    { name: 'Bookings', url: '/api/bookings' },
    { name: 'Table Reservations', url: '/api/table-reservations' },
    { name: 'Tables', url: '/api/tables' },
    { name: 'Feedback Analytics', url: '/api/feedback/analytics' },
    { name: 'Admin Analytics', url: '/api/admin/dashboard/analytics' },
    { name: 'Health Check', url: '/api/health' }
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);
      const response = await axios.get(`${BASE_URL}${endpoint.url}`, {
        timeout: 5000,
        headers: {
          'Authorization': 'Bearer test-token' // You may need to replace with actual token
        }
      });
      
      results.push({
        name: endpoint.name,
        url: endpoint.url,
        status: response.status,
        success: true,
        dataLength: Array.isArray(response.data) ? response.data.length : 
                   response.data?.analytics ? 'Analytics Object' :
                   response.data?.orders ? response.data.orders.length :
                   'Data Available'
      });
      
      console.log(`✅ ${endpoint.name}: ${response.status} - Data: ${results[results.length - 1].dataLength}`);
      
    } catch (error) {
      results.push({
        name: endpoint.name,
        url: endpoint.url,
        status: error.response?.status || 'Network Error',
        success: false,
        error: error.message
      });
      
      console.log(`❌ ${endpoint.name}: ${error.response?.status || 'Network Error'} - ${error.message}`);
    }
  }

  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  
  if (failed > 0) {
    console.log('\n🔧 Failed Endpoints:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`   - ${result.name} (${result.url}): ${result.error}`);
    });
  }

  console.log('\n💡 Recommendations:');
  console.log('- Ensure the backend server is running on port 8080');
  console.log('- Check if authentication is required for protected endpoints');
  console.log('- Verify database connections are working');
  console.log('- Make sure all required models and controllers are properly imported');

  return results;
}

// Test specific analytics endpoint
async function testAnalyticsEndpoint() {
  console.log('\n🔍 Testing Analytics Endpoint in Detail...\n');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/dashboard/analytics`, {
      timeout: 10000,
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });

    console.log('✅ Analytics Response Structure:');
    console.log('================================');
    
    const analytics = response.data.analytics;
    
    if (analytics) {
      console.log('📈 Overview:', {
        totalRevenue: analytics.overview?.totalRevenue || 0,
        totalItems: analytics.overview?.totalItems || 0,
        totalUsers: analytics.overview?.totalUsers || 0,
        revenueGrowth: analytics.overview?.revenueGrowth || 0
      });
      
      console.log('💰 Revenue:', {
        total: analytics.revenue?.total || 0,
        food: analytics.revenue?.food || 0,
        rooms: analytics.revenue?.rooms || 0,
        tables: analytics.revenue?.tables || 0
      });
      
      console.log('🏨 Rooms:', {
        total: analytics.rooms?.total || 0,
        occupied: analytics.rooms?.occupied || 0,
        available: analytics.rooms?.available || 0,
        occupancyRate: analytics.rooms?.occupancyRate || 0
      });
      
      console.log('🍽️ Food:', {
        totalMenuItems: analytics.food?.totalMenuItems || 0,
        totalOrders: analytics.food?.totalOrders || 0,
        successRate: analytics.food?.successRate || 0
      });
      
      console.log('🪑 Tables:', {
        total: analytics.tables?.total || 0,
        reservations: analytics.tables?.reservations || 0,
        todayReservations: analytics.tables?.todayReservations || 0
      });
      
      console.log('📊 Activity:', {
        today: analytics.activity?.today || {},
        thisMonth: analytics.activity?.thisMonth || {}
      });
      
    } else {
      console.log('❌ No analytics data found in response');
    }
    
  } catch (error) {
    console.log('❌ Analytics Endpoint Error:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting Admin Dashboard API Tests\n');
  console.log('=====================================\n');
  
  await testDashboardAPIs();
  await testAnalyticsEndpoint();
  
  console.log('\n✨ Testing Complete!');
  console.log('\nNext Steps:');
  console.log('1. Fix any failed endpoints');
  console.log('2. Ensure proper authentication tokens');
  console.log('3. Test the frontend dashboard');
  console.log('4. Verify real data is being displayed');
}

// Export for use in other files
module.exports = {
  testDashboardAPIs,
  testAnalyticsEndpoint,
  runAllTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}
