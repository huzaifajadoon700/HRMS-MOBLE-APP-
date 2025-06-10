const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../Models/User');
const UserRoomInteraction = require('../Models/UserRoomInteraction');
const UserFoodInteraction = require('../Models/UserFoodInteraction');
const TableInteraction = require('../Models/TableInteraction');
require('dotenv').config();

// Test configuration
const API_BASE = 'http://localhost:8080/api';
const TEST_USER_EMAIL = 'test@recommendation.com';
const TEST_USER_PASSWORD = 'testpass123';

async function testRecommendationSystems() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.Mongo_Conn || 'mongodb://localhost:27017/hrms');
    console.log('🔗 Connected to MongoDB');

    console.log('\n=== COMPREHENSIVE RECOMMENDATION SYSTEM TESTING ===\n');

    // 1. Create or get test user
    let testUser = await User.findOne({ email: TEST_USER_EMAIL });
    if (!testUser) {
      testUser = new User({
        name: 'Test User',
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
        role: 'user'
      });
      await testUser.save();
      console.log('✅ Created test user');
    } else {
      console.log('✅ Using existing test user');
    }

    // 2. Create user interaction history (simulate 1-month history)
    await createUserHistory(testUser._id);

    // 3. Test Room Recommendations
    console.log('\n🏨 TESTING ROOM RECOMMENDATIONS');
    await testRoomRecommendations(testUser._id);

    // 4. Test Table Recommendations  
    console.log('\n🍽️ TESTING TABLE RECOMMENDATIONS');
    await testTableRecommendations(testUser._id);

    // 5. Test Food Recommendations
    console.log('\n🍕 TESTING FOOD RECOMMENDATIONS');
    await testFoodRecommendations(testUser._id);

    // 6. Test for new user (no history)
    console.log('\n👤 TESTING NEW USER RECOMMENDATIONS');
    await testNewUserRecommendations();

    console.log('\n🎉 All recommendation system tests completed!');

  } catch (error) {
    console.error('❌ Error testing recommendations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

async function createUserHistory(userId) {
  console.log('📊 Creating user interaction history...');
  
  // Clear existing interactions
  await UserRoomInteraction.deleteMany({ userId });
  await UserFoodInteraction.deleteMany({ userId });
  await TableInteraction.deleteMany({ userId });

  // Get some sample data
  const Room = require('../Models/Room');
  const Menu = require('../Models/Menu');
  const Table = require('../Models/Table');

  const rooms = await Room.find().limit(5);
  const menuItems = await Menu.find().limit(5);
  const tables = await Table.find().limit(3);

  // Create room interactions (last 30 days)
  const roomInteractions = [];
  for (let i = 0; i < 3; i++) {
    const room = rooms[i % rooms.length];
    roomInteractions.push({
      userId,
      roomId: room._id,
      interactionType: 'view',
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    });
  }
  await UserRoomInteraction.insertMany(roomInteractions);

  // Create food interactions
  const foodInteractions = [];
  for (let i = 0; i < 4; i++) {
    const menuItem = menuItems[i % menuItems.length];
    foodInteractions.push({
      userId,
      menuItemId: menuItem._id,
      interactionType: 'order',
      rating: Math.floor(Math.random() * 2) + 4,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    });
  }
  await UserFoodInteraction.insertMany(foodInteractions);

  // Create table interactions
  const tableInteractions = [];
  for (let i = 0; i < 2; i++) {
    const table = tables[i % tables.length];
    tableInteractions.push({
      userId,
      tableId: table._id,
      interactionType: 'booking',
      rating: Math.floor(Math.random() * 2) + 4,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    });
  }
  await TableInteraction.insertMany(tableInteractions);

  console.log(`✅ Created interaction history: ${roomInteractions.length} room, ${foodInteractions.length} food, ${tableInteractions.length} table interactions`);
}

async function testRoomRecommendations(userId) {
  try {
    // Test room recommendations API
    const response = await axios.get(`${API_BASE}/rooms/recommendations/${userId}?count=6`);
    
    if (response.data.success) {
      const recommendations = response.data.recommendations || response.data.rooms || [];
      console.log(`✅ Room recommendations: ${recommendations.length} items`);
      
      recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec.roomNumber || rec.room?.roomNumber} - ${rec.roomType || rec.room?.roomType} - Rs.${rec.price || rec.room?.price}`);
        console.log(`     Reason: ${rec.reason || 'N/A'} | Score: ${rec.score || 'N/A'}`);
      });

      // Check if it considers user history
      const hasPersonalized = recommendations.some(rec => 
        rec.reason === 'collaborative_filtering' || rec.reason === 'content_based'
      );
      console.log(`📈 Uses user history: ${hasPersonalized ? 'YES' : 'NO'}`);
      
    } else {
      console.log('❌ Room recommendations failed:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Room recommendations error:', error.message);
  }
}

async function testTableRecommendations(userId) {
  try {
    // Test table recommendations API
    const response = await axios.get(`${API_BASE}/table-recommendations/recommendations`, {
      params: {
        userId: userId,
        occasion: 'dinner',
        partySize: 4,
        timeSlot: 'evening',
        numRecommendations: 6
      }
    });
    
    if (response.data.success) {
      const recommendations = response.data.recommendations || [];
      console.log(`✅ Table recommendations: ${recommendations.length} items`);
      
      recommendations.slice(0, 3).forEach((rec, index) => {
        const table = rec.table || rec;
        console.log(`  ${index + 1}. ${table.tableName} - ${table.capacity} seats - ${table.ambiance}`);
        console.log(`     Reason: ${rec.reason || 'N/A'} | Score: ${rec.score || 'N/A'}`);
      });

      // Check contextual factors
      const hasContextual = recommendations.some(rec => rec.reason === 'contextual');
      console.log(`🎯 Uses contextual factors: ${hasContextual ? 'YES' : 'NO'}`);
      
    } else {
      console.log('❌ Table recommendations failed:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Table recommendations error:', error.message);
  }
}

async function testFoodRecommendations(userId) {
  try {
    // Test food recommendations API
    const response = await axios.get(`${API_BASE}/food-recommendations/recommendations/${userId}?count=8`);
    
    if (response.data.success) {
      const recommendations = response.data.recommendations || [];
      console.log(`✅ Food recommendations: ${recommendations.length} items`);
      
      recommendations.slice(0, 3).forEach((rec, index) => {
        const item = rec.menuItem || rec;
        console.log(`  ${index + 1}. ${item.name} - Rs.${item.price} (${item.category})`);
        console.log(`     Reason: ${rec.reason || 'N/A'} | Score: ${rec.score || 'N/A'}`);
      });

      // Check if it uses user preferences
      const hasPersonalized = recommendations.some(rec => 
        rec.reason === 'collaborative_filtering' || rec.reason === 'content_based'
      );
      console.log(`👤 Uses user preferences: ${hasPersonalized ? 'YES' : 'NO'}`);
      
    } else {
      console.log('❌ Food recommendations failed:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Food recommendations error:', error.message);
  }
}

async function testNewUserRecommendations() {
  try {
    // Create a new user with no history
    const newUser = new User({
      name: 'New User',
      email: 'newuser@test.com',
      password: 'newpass123',
      role: 'user'
    });
    await newUser.save();

    console.log('👤 Testing recommendations for new user (no history)...');

    // Test room recommendations for new user
    try {
      const roomResponse = await axios.get(`${API_BASE}/rooms/recommendations/${newUser._id}?count=3`);
      if (roomResponse.data.success) {
        const rooms = roomResponse.data.recommendations || roomResponse.data.rooms || [];
        console.log(`✅ New user room recommendations: ${rooms.length} items (should be popularity-based)`);
        const isPopularityBased = rooms.every(rec => rec.reason === 'popularity' || !rec.reason);
        console.log(`📊 Popularity-based: ${isPopularityBased ? 'YES' : 'NO'}`);
      }
    } catch (error) {
      console.log('❌ New user room recommendations failed');
    }

    // Test food recommendations for new user
    try {
      const foodResponse = await axios.get(`${API_BASE}/food-recommendations/recommendations/${newUser._id}?count=3`);
      if (foodResponse.data.success) {
        const foods = foodResponse.data.recommendations || [];
        console.log(`✅ New user food recommendations: ${foods.length} items (should be popularity-based)`);
      }
    } catch (error) {
      console.log('❌ New user food recommendations failed');
    }

    // Clean up
    await User.findByIdAndDelete(newUser._id);

  } catch (error) {
    console.log('❌ New user test error:', error.message);
  }
}

if (require.main === module) {
  testRecommendationSystems();
}

module.exports = { testRecommendationSystems };
