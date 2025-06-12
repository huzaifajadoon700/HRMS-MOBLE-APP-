const mongoose = require('mongoose');
const User = require('../Models/User');
const UserRoomInteraction = require('../Models/UserRoomInteraction');
const UserFoodInteraction = require('../Models/UserFoodInteraction');
const TableInteraction = require('../Models/TableInteraction');
const Room = require('../Models/Room');
const Table = require('../Models/Table');
const Menu = require('../Models/Menu');
const RoomRecommendation = require('../Models/RoomRecommendation');
const TableRecommendation = require('../Models/TableRecommendation');
const FoodRecommendation = require('../Models/FoodRecommendation');

// Import recommendation controllers
const roomController = require('../Controllers/roomController');
const FoodRecommendationController = require('../Controllers/FoodRecommendationController');

require('dotenv').config();

const TEST_USER_EMAIL = 'test@recommendation.com';

async function testRecommendationsOffline() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.Mongo_Conn || 'mongodb://localhost:27017/hrms');
    console.log('🔗 Connected to MongoDB');

    console.log('\n=== OFFLINE RECOMMENDATION SYSTEM TESTING ===\n');

    // 1. Create or get test user
    let testUser = await User.findOne({ email: TEST_USER_EMAIL });
    if (!testUser) {
      testUser = new User({
        name: 'Test User',
        email: TEST_USER_EMAIL,
        password: 'testpass123',
        role: 'user'
      });
      await testUser.save();
      console.log('✅ Created test user');
    } else {
      console.log('✅ Using existing test user');
    }

    // 2. Create user interaction history
    await createUserHistory(testUser._id);

    // 3. Test Room Recommendations (Direct Controller)
    console.log('\n🏨 TESTING ROOM RECOMMENDATIONS (Direct)');
    await testRoomRecommendationsDirect(testUser._id);

    // 4. Test Food Recommendations (Direct Controller)
    console.log('\n🍕 TESTING FOOD RECOMMENDATIONS (Direct)');
    await testFoodRecommendationsDirect(testUser._id);

    // 5. Test for new user
    console.log('\n👤 TESTING NEW USER RECOMMENDATIONS');
    await testNewUserRecommendationsDirect();

    // 6. Verify database state
    console.log('\n📊 FINAL DATABASE VERIFICATION');
    await verifyDatabaseState();

    console.log('\n🎉 Offline recommendation system tests completed!');

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

  // Get sample data
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

async function testRoomRecommendationsDirect(userId) {
  try {
    // Test room recommendations using direct controller method
    const result = await roomController.generateRoomRecommendations(userId, { count: 6 });
    
    if (result && result.rooms) {
      const recommendations = result.rooms;
      console.log(`✅ Room recommendations: ${recommendations.length} items`);
      
      recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec.roomNumber} - ${rec.roomType} - Rs.${rec.price}`);
        console.log(`     Reason: ${rec.reason || 'N/A'} | Score: ${rec.score || 'N/A'}`);
      });

      // Check if it considers user history
      const hasPersonalized = recommendations.some(rec => 
        rec.reason === 'collaborative_filtering' || rec.reason === 'content_based'
      );
      console.log(`📈 Uses user history: ${hasPersonalized ? 'YES' : 'NO'}`);
      
      // Check if new user gets popularity-based
      if (result.preferences && result.preferences.newUser) {
        console.log(`👤 New user detected: Using popularity-based recommendations`);
      }
      
    } else {
      console.log('❌ Room recommendations failed: No results returned');
    }
  } catch (error) {
    console.log('❌ Room recommendations error:', error.message);
  }
}

async function testFoodRecommendationsDirect(userId) {
  try {
    // Test food recommendations using direct controller method
    const result = await FoodRecommendationController.generateRecommendations(userId, 8);
    
    if (result && result.items) {
      const recommendations = result.items;
      console.log(`✅ Food recommendations: ${recommendations.length} items`);
      
      recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec.name} - Rs.${rec.price} (${rec.category})`);
        console.log(`     Reason: ${rec.reason || 'N/A'} | Score: ${rec.score || 'N/A'}`);
      });

      // Check if it uses user preferences
      const hasPersonalized = recommendations.some(rec => 
        rec.reason === 'collaborative_filtering' || rec.reason === 'content_based'
      );
      console.log(`👤 Uses user preferences: ${hasPersonalized ? 'YES' : 'NO'}`);
      
      // Check if new user gets popularity-based
      if (result.preferences && result.preferences.newUser) {
        console.log(`👤 New user detected: Using popularity-based recommendations`);
      }
      
    } else {
      console.log('❌ Food recommendations failed: No results returned');
    }
  } catch (error) {
    console.log('❌ Food recommendations error:', error.message);
  }
}

async function testNewUserRecommendationsDirect() {
  try {
    // Create a new user with no history
    const newUser = new User({
      name: 'New User Test',
      email: 'newuser@offline.test',
      password: 'newpass123',
      role: 'user'
    });
    await newUser.save();

    console.log('👤 Testing recommendations for new user (no history)...');

    // Test room recommendations for new user
    try {
      const roomResult = await roomController.generateRoomRecommendations(newUser._id, { count: 3 });
      if (roomResult && roomResult.rooms) {
        const rooms = roomResult.rooms;
        console.log(`✅ New user room recommendations: ${rooms.length} items`);
        const isPopularityBased = rooms.every(rec => rec.reason === 'popularity' || !rec.reason);
        console.log(`📊 Popularity-based: ${isPopularityBased ? 'YES' : 'NO'}`);
        
        if (roomResult.preferences && roomResult.preferences.newUser) {
          console.log(`✅ Correctly identified as new user`);
        }
      }
    } catch (error) {
      console.log('❌ New user room recommendations failed:', error.message);
    }

    // Test food recommendations for new user
    try {
      const foodResult = await FoodRecommendationController.generateRecommendations(newUser._id, 3);
      if (foodResult && foodResult.items) {
        const foods = foodResult.items;
        console.log(`✅ New user food recommendations: ${foods.length} items`);
        
        if (foodResult.preferences && foodResult.preferences.newUser) {
          console.log(`✅ Correctly identified as new user`);
        }
      }
    } catch (error) {
      console.log('❌ New user food recommendations failed:', error.message);
    }

    // Clean up
    await User.findByIdAndDelete(newUser._id);

  } catch (error) {
    console.log('❌ New user test error:', error.message);
  }
}

async function verifyDatabaseState() {
  try {
    const roomCount = await Room.countDocuments();
    const tableCount = await Table.countDocuments();
    const menuCount = await Menu.countDocuments();
    
    const roomRecCount = await RoomRecommendation.countDocuments();
    const tableRecCount = await TableRecommendation.countDocuments();
    const foodRecCount = await FoodRecommendation.countDocuments();
    
    const userRoomInteractions = await UserRoomInteraction.countDocuments();
    const userFoodInteractions = await UserFoodInteraction.countDocuments();
    const tableInteractions = await TableInteraction.countDocuments();
    
    console.log('📊 Database State:');
    console.log(`   Rooms: ${roomCount}`);
    console.log(`   Tables: ${tableCount}`);
    console.log(`   Menu Items: ${menuCount}`);
    console.log('');
    console.log('📈 Recommendation Data:');
    console.log(`   Room Recommendations: ${roomRecCount}`);
    console.log(`   Table Recommendations: ${tableRecCount}`);
    console.log(`   Food Recommendations: ${foodRecCount}`);
    console.log('');
    console.log('👥 User Interactions:');
    console.log(`   Room Interactions: ${userRoomInteractions}`);
    console.log(`   Food Interactions: ${userFoodInteractions}`);
    console.log(`   Table Interactions: ${tableInteractions}`);
    
    // Check if we have enough data
    const hasEnoughData = roomCount >= 10 && tableCount >= 2 && menuCount >= 10;
    console.log(`\n✅ Sufficient data for recommendations: ${hasEnoughData ? 'YES' : 'NO'}`);
    
    // Check if interactions are within 30 days (recommendation window)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRoomInteractions = await UserRoomInteraction.countDocuments({
      timestamp: { $gte: thirtyDaysAgo }
    });
    const recentFoodInteractions = await UserFoodInteraction.countDocuments({
      timestamp: { $gte: thirtyDaysAgo }
    });
    
    console.log(`📅 Recent interactions (30 days):`);
    console.log(`   Room: ${recentRoomInteractions}`);
    console.log(`   Food: ${recentFoodInteractions}`);
    
  } catch (error) {
    console.log('❌ Database verification error:', error.message);
  }
}

if (require.main === module) {
  testRecommendationsOffline();
}

module.exports = { testRecommendationsOffline };
