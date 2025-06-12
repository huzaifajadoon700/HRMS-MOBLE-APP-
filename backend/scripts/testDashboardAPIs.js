const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

// Test admin credentials - you'll need to replace with actual admin token
const ADMIN_TOKEN = 'your_admin_token_here'; // Replace with actual token

async function testDashboardAPIs() {
  console.log('🧪 Testing Dashboard APIs...\n');

  try {
    // Test 1: Analytics API
    console.log('1️⃣ Testing Analytics API...');
    try {
      const analyticsResponse = await axios.get(`${BASE_URL}/api/admin/dashboard/analytics`, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
      });
      
      console.log('✅ Analytics API Success');
      console.log('📊 Revenue:', analyticsResponse.data.analytics.revenue);
      console.log('🍽️ Food Data:', analyticsResponse.data.analytics.food);
      console.log('🏨 Rooms Data:', analyticsResponse.data.analytics.rooms);
    } catch (error) {
      console.log('❌ Analytics API Failed:', error.response?.status, error.response?.data?.message);
    }

    // Test 2: Orders API
    console.log('\n2️⃣ Testing Orders API...');
    try {
      const ordersResponse = await axios.get(`${BASE_URL}/api/orders?limit=1000`, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
      });
      
      console.log('✅ Orders API Success');
      console.log('📦 Orders Count:', ordersResponse.data.orders?.length || 0);
      if (ordersResponse.data.orders?.length > 0) {
        const sampleOrder = ordersResponse.data.orders[0];
        console.log('📦 Sample Order:', {
          id: sampleOrder._id,
          totalPrice: sampleOrder.totalPrice,
          status: sampleOrder.status,
          itemsCount: sampleOrder.items?.length || 0,
          sampleItem: sampleOrder.items?.[0]
        });
      }
    } catch (error) {
      console.log('❌ Orders API Failed:', error.response?.status, error.response?.data?.message);
    }

    // Test 3: Bookings API
    console.log('\n3️⃣ Testing Bookings API...');
    try {
      const bookingsResponse = await axios.get(`${BASE_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
      });
      
      console.log('✅ Bookings API Success');
      console.log('🏨 Bookings Count:', bookingsResponse.data?.length || 0);
    } catch (error) {
      console.log('❌ Bookings API Failed:', error.response?.status, error.response?.data?.message);
    }

    // Test 4: Rooms API
    console.log('\n4️⃣ Testing Rooms API...');
    try {
      const roomsResponse = await axios.get(`${BASE_URL}/api/rooms`, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
      });
      
      console.log('✅ Rooms API Success');
      console.log('🏨 Rooms Count:', roomsResponse.data?.length || 0);
    } catch (error) {
      console.log('❌ Rooms API Failed:', error.response?.status, error.response?.data?.message);
    }

    // Test 5: Menus API
    console.log('\n5️⃣ Testing Menus API...');
    try {
      const menusResponse = await axios.get(`${BASE_URL}/api/menus`, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
      });
      
      console.log('✅ Menus API Success');
      console.log('🍽️ Menu Items Count:', menusResponse.data?.length || 0);
    } catch (error) {
      console.log('❌ Menus API Failed:', error.response?.status, error.response?.data?.message);
    }

  } catch (error) {
    console.error('❌ General Error:', error.message);
  }
}

// Test without authentication first
async function testPublicAPIs() {
  console.log('🌐 Testing Public APIs...\n');

  try {
    // Test status endpoint
    const statusResponse = await axios.get(`${BASE_URL}/api/status`);
    console.log('✅ Status API Success:', statusResponse.data.status);
    
    // Test public rooms
    const roomsResponse = await axios.get(`${BASE_URL}/api/rooms`);
    console.log('✅ Public Rooms API Success, Count:', roomsResponse.data?.length || 0);
    
    // Test public menus
    const menusResponse = await axios.get(`${BASE_URL}/api/menus`);
    console.log('✅ Public Menus API Success, Count:', menusResponse.data?.length || 0);
    
  } catch (error) {
    console.error('❌ Public API Error:', error.message);
  }
}

async function main() {
  console.log('🔍 DASHBOARD API TESTING\n');
  
  // First test public APIs
  await testPublicAPIs();
  
  console.log('\n' + '='.repeat(50));
  console.log('⚠️  For authenticated APIs, please:');
  console.log('1. Login to the admin panel');
  console.log('2. Get the JWT token from localStorage');
  console.log('3. Replace ADMIN_TOKEN in this script');
  console.log('4. Run the script again');
  console.log('='.repeat(50) + '\n');
  
  // Uncomment this when you have a valid token
  // await testDashboardAPIs();
}

if (require.main === module) {
  main();
}

module.exports = { testDashboardAPIs, testPublicAPIs };
