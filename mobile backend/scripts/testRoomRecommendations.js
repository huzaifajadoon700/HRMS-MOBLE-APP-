// scripts/testRoomRecommendations.js
const mongoose = require('mongoose');
const Room = require('../Models/Room');
const UserRoomInteraction = require('../Models/UserRoomInteraction');
const User = require('../Models/User');
require('dotenv').config();

// Test user IDs (you'll need to replace these with actual user IDs from your database)
const testUserIds = [
  '507f1f77bcf86cd799439011', // Replace with actual user IDs
  '507f1f77bcf86cd799439012',
  '507f1f77bcf86cd799439013'
];

// Sample interactions to create 1-month user history
const sampleInteractions = [
  // User 1 - Prefers luxury rooms
  { userId: testUserIds[0], roomNumber: '301', interactionType: 'view', rating: null, groupSize: 2 },
  { userId: testUserIds[0], roomNumber: '401', interactionType: 'view', rating: null, groupSize: 2 },
  { userId: testUserIds[0], roomNumber: '301', interactionType: 'booking', rating: 5, groupSize: 2, bookingDuration: 3 },
  { userId: testUserIds[0], roomNumber: '203', interactionType: 'rating', rating: 4, groupSize: 2 },
  
  // User 2 - Prefers budget rooms
  { userId: testUserIds[1], roomNumber: '101', interactionType: 'view', rating: null, groupSize: 1 },
  { userId: testUserIds[1], roomNumber: '104', interactionType: 'view', rating: null, groupSize: 1 },
  { userId: testUserIds[1], roomNumber: '104', interactionType: 'booking', rating: 4, groupSize: 1, bookingDuration: 2 },
  { userId: testUserIds[1], roomNumber: '103', interactionType: 'rating', rating: 3, groupSize: 2 },
  
  // User 3 - Prefers family rooms
  { userId: testUserIds[2], roomNumber: '202', interactionType: 'view', rating: null, groupSize: 4 },
  { userId: testUserIds[2], roomNumber: '202', interactionType: 'booking', rating: 5, groupSize: 4, bookingDuration: 5 },
  { userId: testUserIds[2], roomNumber: '203', interactionType: 'view', rating: null, groupSize: 4 },
  { userId: testUserIds[2], roomNumber: '301', interactionType: 'rating', rating: 4, groupSize: 4 }
];

async function createTestInteractions() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hrms');

    // Get available rooms
    const rooms = await Room.find({});
    if (rooms.length === 0) {
      console.log('❌ No rooms found. Please run the room seeder first.');
      return;
    }

    console.log(`📊 Found ${rooms.length} rooms in database`);

    // Create room number to ID mapping
    const roomMap = {};
    rooms.forEach(room => {
      roomMap[room.roomNumber] = room._id;
    });

    // Clear existing test interactions
    await UserRoomInteraction.deleteMany({ userId: { $in: testUserIds } });
    console.log('🗑️ Cleared existing test interactions');

    // Create sample interactions with actual room IDs
    const interactions = [];
    for (const interaction of sampleInteractions) {
      const roomId = roomMap[interaction.roomNumber];
      if (roomId) {
        interactions.push({
          ...interaction,
          roomId: roomId,
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random time in last 30 days
          checkInDate: interaction.interactionType === 'booking' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined,
          checkOutDate: interaction.interactionType === 'booking' ? new Date(Date.now() + (7 + interaction.bookingDuration) * 24 * 60 * 60 * 1000) : undefined
        });
      }
    }

    // Insert interactions
    const insertedInteractions = await UserRoomInteraction.insertMany(interactions);
    console.log(`✅ Created ${insertedInteractions.length} test interactions`);

    // Test the recommendation system
    console.log('\n🤖 Testing Room Recommendation System...\n');

    const roomController = require('../Controllers/roomController');

    for (let i = 0; i < testUserIds.length; i++) {
      const userId = testUserIds[i];
      console.log(`👤 Testing recommendations for User ${i + 1} (${userId}):`);

      try {
        // Get user's interaction history
        const userInteractions = await UserRoomInteraction.find({ userId }).populate('roomId');
        console.log(`  📊 User has ${userInteractions.length} interactions`);

        // Analyze preferences
        const preferences = roomController.analyzeUserRoomPreferences(userInteractions);
        console.log(`  ⭐ Average rating: ${preferences.avgRating.toFixed(2)}`);
        console.log(`  👥 Average group size: ${preferences.avgGroupSize.toFixed(1)}`);
        console.log(`  🏨 Preferred room types:`, Object.keys(preferences.preferredRoomTypes));

        // Generate recommendations
        const recommendations = await roomController.generateRoomRecommendations(userId, { count: 5 });
        
        console.log(`  🎯 Generated ${recommendations.rooms.length} recommendations:`);
        recommendations.rooms.forEach((rec, index) => {
          console.log(`    ${index + 1}. Room ${rec.roomDetails?.roomNumber || 'N/A'} (${rec.roomDetails?.roomType || 'N/A'}) - Score: ${rec.score.toFixed(2)} - Reason: ${rec.reason}`);
        });

      } catch (error) {
        console.error(`  ❌ Error generating recommendations for user ${i + 1}:`, error.message);
      }

      console.log(''); // Empty line for readability
    }

    // Test popular rooms
    console.log('🔥 Testing Popular Rooms:');
    const popularRooms = await roomController.getPopularityBasedRoomRecommendations(5);
    popularRooms.forEach((room, index) => {
      console.log(`  ${index + 1}. Room ${room.roomDetails?.roomNumber || 'N/A'} (${room.roomDetails?.roomType || 'N/A'}) - Score: ${room.score.toFixed(2)}`);
    });

    console.log('\n🎉 Room recommendation system test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing room recommendations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

async function testAPIEndpoints() {
  console.log('\n🔗 Testing API Endpoints...');
  
  const axios = require('axios');
  const baseURL = 'http://localhost:8080/api';

  try {
    // Test popular rooms endpoint
    console.log('📡 Testing GET /api/rooms/popular');
    const popularResponse = await axios.get(`${baseURL}/rooms/popular?count=5`);
    console.log(`✅ Popular rooms: ${popularResponse.data.popularRooms?.length || 0} rooms returned`);

    // Test room recommendations (requires authentication)
    console.log('📡 Testing room recommendation endpoints...');
    console.log('ℹ️ Note: Authentication required for recommendation endpoints');
    console.log('ℹ️ Use Postman or frontend to test authenticated endpoints');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️ Server not running. Start the server first to test API endpoints.');
    } else {
      console.error('❌ API test error:', error.message);
    }
  }
}

// Main execution
async function runTests() {
  console.log('🏨 Room Recommendation System Test Suite\n');
  
  await createTestInteractions();
  await testAPIEndpoints();
}

if (require.main === module) {
  runTests();
}

module.exports = { createTestInteractions, testAPIEndpoints };
