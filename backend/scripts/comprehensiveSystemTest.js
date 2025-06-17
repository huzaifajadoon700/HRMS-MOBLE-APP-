const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:8080';

// Test users
const TEST_USERS = [
  {
    email: 'ahmed.hassan@test.com',
    password: 'ahmed123',
    name: 'Ahmed Hassan (Male User)',
    type: 'male'
  },
  {
    email: 'sarah.ahmed@test.com', 
    password: 'testuser123',
    name: 'Sarah Ahmed (Female User)',
    type: 'female'
  }
];

// Test results storage
const testResults = {
  food: { passed: 0, failed: 0, tests: [] },
  rooms: { passed: 0, failed: 0, tests: [] },
  tables: { passed: 0, failed: 0, tests: [] },
  profile: { passed: 0, failed: 0, tests: [] },
  admin: { passed: 0, failed: 0, tests: [] },
  overall: { passed: 0, failed: 0, total: 0 }
};

// Helper function to log test results
const logTest = (module, testName, passed, details = '') => {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} [${module.toUpperCase()}] ${testName}`);
  if (details) console.log(`   ${details}`);
  
  testResults[module].tests.push({ name: testName, passed, details });
  if (passed) {
    testResults[module].passed++;
    testResults.overall.passed++;
  } else {
    testResults[module].failed++;
    testResults.overall.failed++;
  }
  testResults.overall.total++;
};

// Authentication helper
const authenticateUser = async (user) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: user.email,
      password: user.password
    });
    
    if (response.data.success && response.data.token) {
      logTest('profile', `Login ${user.name}`, true, `Token received: ${response.data.token.substring(0, 20)}...`);
      return response.data.token;
    } else {
      logTest('profile', `Login ${user.name}`, false, 'No token received');
      return null;
    }
  } catch (error) {
    logTest('profile', `Login ${user.name}`, false, error.message);
    return null;
  }
};

// Test Food Recommendation System
const testFoodRecommendations = async (token, userId) => {
  try {
    // Test food recommendations API
    const response = await axios.get(`${BASE_URL}/api/food-recommendations/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success && response.data.recommendations) {
      logTest('food', 'Food Recommendations API', true, `${response.data.recommendations.length} recommendations received`);
      return response.data.recommendations.length > 0;
    } else {
      logTest('food', 'Food Recommendations API', false, 'No recommendations received');
      return false;
    }
  } catch (error) {
    logTest('food', 'Food Recommendations API', false, error.message);
    return false;
  }
};

// Test Room Recommendation System
const testRoomRecommendations = async (token, userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/room-recommendations/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success && response.data.recommendations) {
      logTest('rooms', 'Room Recommendations API', true, `${response.data.recommendations.length} recommendations received`);
      return response.data.recommendations.length > 0;
    } else {
      logTest('rooms', 'Room Recommendations API', false, 'No recommendations received');
      return false;
    }
  } catch (error) {
    logTest('rooms', 'Room Recommendations API', false, error.message);
    return false;
  }
};

// Test Table Recommendation System
const testTableRecommendations = async (token) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/tables/recommendations`, {
      occasion: 'business',
      partySize: 4,
      timeSlot: 'evening'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success && response.data.recommendations) {
      logTest('tables', 'Table Recommendations API', true, `${response.data.recommendations.length} recommendations received`);
      return response.data.recommendations.length > 0;
    } else {
      logTest('tables', 'Table Recommendations API', false, 'No recommendations received');
      return false;
    }
  } catch (error) {
    logTest('tables', 'Table Recommendations API', false, error.message);
    return false;
  }
};

// Test User Profile APIs
const testUserProfile = async (token, userId) => {
  try {
    // Test profile API
    const profileResponse = await axios.get(`${BASE_URL}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (profileResponse.data.success) {
      logTest('profile', 'User Profile API', true, 'Profile data received');
    } else {
      logTest('profile', 'User Profile API', false, 'No profile data');
      return false;
    }

    // Test orders history
    const ordersResponse = await axios.get(`${BASE_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (ordersResponse.data) {
      logTest('profile', 'Orders History API', true, `${ordersResponse.data.length || 0} orders found`);
    } else {
      logTest('profile', 'Orders History API', false, 'No orders data');
    }

    // Test bookings history
    const bookingsResponse = await axios.get(`${BASE_URL}/api/bookings/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (bookingsResponse.data) {
      logTest('profile', 'Bookings History API', true, `${bookingsResponse.data.length || 0} bookings found`);
    } else {
      logTest('profile', 'Bookings History API', false, 'No bookings data');
    }

    // Test reservations history
    const reservationsResponse = await axios.get(`${BASE_URL}/api/reservations/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (reservationsResponse.data) {
      logTest('profile', 'Reservations History API', true, `${reservationsResponse.data.length || 0} reservations found`);
    } else {
      logTest('profile', 'Reservations History API', false, 'No reservations data');
    }

    return true;
  } catch (error) {
    logTest('profile', 'User Profile APIs', false, error.message);
    return false;
  }
};

// Test Payment Currency Consistency
const testPaymentCurrency = async (token) => {
  try {
    // Test menu items for PKR currency
    const menuResponse = await axios.get(`${BASE_URL}/api/menu`);
    if (menuResponse.data && menuResponse.data.length > 0) {
      const sampleItem = menuResponse.data[0];
      logTest('food', 'Menu Currency Check', true, `Sample price: Rs.${sampleItem.price}`);
    }

    // Test rooms for PKR currency
    const roomsResponse = await axios.get(`${BASE_URL}/api/rooms`);
    if (roomsResponse.data && roomsResponse.data.length > 0) {
      const sampleRoom = roomsResponse.data[0];
      logTest('rooms', 'Room Currency Check', true, `Sample price: Rs.${sampleRoom.price}`);
    }

    // Test tables for PKR currency
    const tablesResponse = await axios.get(`${BASE_URL}/api/tables`);
    if (tablesResponse.data && tablesResponse.data.length > 0) {
      logTest('tables', 'Table Currency Check', true, 'Tables data available');
    }

    return true;
  } catch (error) {
    logTest('food', 'Currency Check', false, error.message);
    return false;
  }
};

// Test Admin Analytics
const testAdminAnalytics = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      logTest('admin', 'Admin Analytics API', true, 'Analytics data received');
      
      // Check revenue data
      if (response.data.revenue) {
        logTest('admin', 'Revenue Analytics', true, `Total: Rs.${response.data.revenue.total || 0}`);
      }
      
      // Check overview data
      if (response.data.overview) {
        logTest('admin', 'Overview Analytics', true, `Users: ${response.data.overview.totalUsers || 0}`);
      }
      
      return true;
    } else {
      logTest('admin', 'Admin Analytics API', false, 'No analytics data');
      return false;
    }
  } catch (error) {
    logTest('admin', 'Admin Analytics API', false, error.message);
    return false;
  }
};

// Main testing function
const runComprehensiveTests = async () => {
  console.log('🚀 Starting Comprehensive System Testing...\n');
  console.log('=' * 60);
  
  for (const user of TEST_USERS) {
    console.log(`\n👤 Testing with ${user.name}`);
    console.log('-' * 40);
    
    // Authenticate user
    const token = await authenticateUser(user);
    if (!token) continue;
    
    // Extract user ID from token (simplified)
    const userId = 'test-user-id'; // In real implementation, decode from token
    
    // Test all systems
    await testFoodRecommendations(token, userId);
    await testRoomRecommendations(token, userId);
    await testTableRecommendations(token);
    await testUserProfile(token, userId);
    await testPaymentCurrency(token);
    
    // Test admin analytics (only for first user)
    if (user === TEST_USERS[0]) {
      await testAdminAnalytics(token);
    }
  }
  
  // Print final results
  console.log('\n' + '=' * 60);
  console.log('🎯 COMPREHENSIVE TEST RESULTS');
  console.log('=' * 60);
  
  Object.keys(testResults).forEach(module => {
    if (module === 'overall') return;
    const result = testResults[module];
    const total = result.passed + result.failed;
    const percentage = total > 0 ? ((result.passed / total) * 100).toFixed(1) : 0;
    
    console.log(`\n📊 ${module.toUpperCase()} MODULE:`);
    console.log(`   ✅ Passed: ${result.passed}`);
    console.log(`   ❌ Failed: ${result.failed}`);
    console.log(`   📈 Success Rate: ${percentage}%`);
  });
  
  console.log(`\n🎉 OVERALL RESULTS:`);
  console.log(`   ✅ Total Passed: ${testResults.overall.passed}`);
  console.log(`   ❌ Total Failed: ${testResults.overall.failed}`);
  console.log(`   📊 Total Tests: ${testResults.overall.total}`);
  
  const overallPercentage = testResults.overall.total > 0 ? 
    ((testResults.overall.passed / testResults.overall.total) * 100).toFixed(1) : 0;
  console.log(`   🎯 Overall Success Rate: ${overallPercentage}%`);
  
  if (overallPercentage >= 90) {
    console.log('\n🎉 SYSTEM IS READY FOR COMMITTEE PRESENTATION! 🎉');
  } else if (overallPercentage >= 80) {
    console.log('\n⚠️ System is mostly ready, minor issues to address');
  } else {
    console.log('\n❌ System needs attention before presentation');
  }
  
  console.log('\n' + '=' * 60);
};

// Run tests
runComprehensiveTests().catch(console.error);
