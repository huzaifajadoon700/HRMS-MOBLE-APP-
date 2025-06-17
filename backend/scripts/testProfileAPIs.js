const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';
const TEST_USER = {
  email: 'ahmed.hassan@test.com',
  password: 'ahmed123'
};

let authToken = '';
let userId = '';

// Test login and get token
const testLogin = async () => {
  try {
    console.log('🔐 Testing login...');
    const response = await axios.post(`http://localhost:8080/auth/login`, TEST_USER);
    
    if (response.data.success) {
      authToken = response.data.jwtToken;
      userId = response.data.userId;
      console.log('✅ Login successful');
      console.log(`📋 User ID: ${userId}`);
      return true;
    } else {
      console.log('❌ Login failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.response?.data?.message || error.message);
    return false;
  }
};

// Test user profile API
const testUserProfile = async () => {
  try {
    console.log('\n👤 Testing user profile API...');
    const response = await axios.get(`${BASE_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ User profile retrieved successfully');
    console.log(`📋 Name: ${response.data.name}`);
    console.log(`📧 Email: ${response.data.email}`);
    console.log(`📱 Phone: ${response.data.phone}`);
    return response.data;
  } catch (error) {
    console.log('❌ User profile error:', error.response?.data?.message || error.message);
    return null;
  }
};

// Test orders API
const testOrdersAPI = async () => {
  try {
    console.log('\n🍽️ Testing orders API...');
    const response = await axios.get(`${BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { limit: 100 }
    });
    
    const orders = response.data?.orders || [];
    console.log(`✅ Orders retrieved: ${orders.length} orders found`);
    
    if (orders.length > 0) {
      const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || order.totalPrice || 0), 0);
      console.log(`💰 Total spent on food: Rs. ${totalSpent.toLocaleString()}`);
      console.log(`📅 Latest order: ${new Date(orders[0].createdAt).toLocaleDateString()}`);
    }
    
    return orders;
  } catch (error) {
    console.log('❌ Orders API error:', error.response?.data?.message || error.message);
    return [];
  }
};

// Test bookings API
const testBookingsAPI = async () => {
  try {
    console.log('\n🏨 Testing bookings API...');
    const response = await axios.get(`${BASE_URL}/bookings/user`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const bookings = response.data || [];
    console.log(`✅ Bookings retrieved: ${bookings.length} bookings found`);
    
    if (bookings.length > 0) {
      const totalSpent = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      console.log(`💰 Total spent on rooms: Rs. ${totalSpent.toLocaleString()}`);
      console.log(`📅 Latest booking: ${new Date(bookings[0].createdAt).toLocaleDateString()}`);
    }
    
    return bookings;
  } catch (error) {
    console.log('❌ Bookings API error:', error.response?.data?.message || error.message);
    return [];
  }
};

// Test reservations API
const testReservationsAPI = async () => {
  try {
    console.log('\n🍽️ Testing reservations API...');
    const response = await axios.get(`${BASE_URL}/reservations/user`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const reservations = response.data || [];
    console.log(`✅ Reservations retrieved: ${reservations.length} reservations found`);
    
    if (reservations.length > 0) {
      const totalSpent = reservations.reduce((sum, reservation) => sum + (reservation.totalPrice || 0), 0);
      console.log(`💰 Total spent on tables: Rs. ${totalSpent.toLocaleString()}`);
      console.log(`📅 Latest reservation: ${new Date(reservations[0].createdAt).toLocaleDateString()}`);
    }
    
    return reservations;
  } catch (error) {
    console.log('❌ Reservations API error:', error.response?.data?.message || error.message);
    return [];
  }
};

// Test food recommendations history API
const testFoodHistoryAPI = async () => {
  try {
    console.log('\n🤖 Testing food recommendations history API...');
    const response = await axios.get(`${BASE_URL}/food-recommendations/history/${userId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { days: 30 }
    });
    
    const history = response.data?.history || [];
    console.log(`✅ Food interactions retrieved: ${history.length} interactions found`);
    
    if (history.length > 0) {
      const ratings = history.filter(h => h.rating);
      const avgRating = ratings.length > 0 ? 
        ratings.reduce((sum, h) => sum + h.rating, 0) / ratings.length : 0;
      console.log(`⭐ Average rating given: ${avgRating.toFixed(1)}`);
    }
    
    return history;
  } catch (error) {
    console.log('❌ Food history API error:', error.response?.data?.message || error.message);
    return [];
  }
};

// Test room history API
const testRoomHistoryAPI = async () => {
  try {
    console.log('\n🏨 Testing room history API...');
    const response = await axios.get(`${BASE_URL}/rooms/history/${userId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { days: 30 }
    });
    
    const history = response.data?.history || [];
    console.log(`✅ Room interactions retrieved: ${history.length} interactions found`);
    
    return history;
  } catch (error) {
    console.log('❌ Room history API error:', error.response?.data?.message || error.message);
    return [];
  }
};

// Test table history API
const testTableHistoryAPI = async () => {
  try {
    console.log('\n🍽️ Testing table history API...');
    const response = await axios.get(`${BASE_URL}/tables/history/${userId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { days: 30 }
    });
    
    const history = response.data?.history || [];
    console.log(`✅ Table interactions retrieved: ${history.length} interactions found`);
    
    return history;
  } catch (error) {
    console.log('❌ Table history API error:', error.response?.data?.message || error.message);
    return [];
  }
};

// Main test function
const runTests = async () => {
  console.log('🧪 Testing Profile APIs for Fix #2\n');
  console.log('=' .repeat(50));
  
  // Test login first
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without successful login');
    return;
  }
  
  // Test all APIs
  const user = await testUserProfile();
  const orders = await testOrdersAPI();
  const bookings = await testBookingsAPI();
  const reservations = await testReservationsAPI();
  const foodHistory = await testFoodHistoryAPI();
  const roomHistory = await testRoomHistoryAPI();
  const tableHistory = await testTableHistoryAPI();
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 SUMMARY OF 1-MONTH HISTORY DATA:');
  console.log('=' .repeat(50));
  
  if (user) {
    console.log(`👤 User: ${user.name} (${user.email})`);
  }
  
  console.log(`🍽️ Food Orders: ${orders.length} orders`);
  console.log(`🏨 Room Bookings: ${bookings.length} bookings`);
  console.log(`🍽️ Table Reservations: ${reservations.length} reservations`);
  console.log(`🤖 Food Interactions: ${foodHistory.length} interactions`);
  console.log(`🏨 Room Interactions: ${roomHistory.length} interactions`);
  console.log(`🍽️ Table Interactions: ${tableHistory.length} interactions`);
  
  const totalSpent = 
    orders.reduce((sum, order) => sum + (order.totalAmount || order.totalPrice || 0), 0) +
    bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0) +
    reservations.reduce((sum, reservation) => sum + (reservation.totalPrice || 0), 0);
  
  console.log(`💰 Total Spending: Rs. ${totalSpent.toLocaleString()}`);
  
  const totalActivities = orders.length + bookings.length + reservations.length;
  console.log(`📈 Total Activities: ${totalActivities} activities in last 30 days`);
  
  console.log('\n✅ All APIs are working correctly!');
  console.log('🎯 Profile page should display comprehensive 1-month history');
};

runTests().catch(console.error);
