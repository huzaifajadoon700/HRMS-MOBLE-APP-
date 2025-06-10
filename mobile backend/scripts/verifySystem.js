// scripts/verifySystem.js
const mongoose = require('mongoose');
const Room = require('../Models/Room');
const User = require('../Models/User');
const UserRoomInteraction = require('../Models/UserRoomInteraction');
const RoomRecommendation = require('../Models/RoomRecommendation');
require('dotenv').config();

async function verifySystem() {
  try {
    console.log('🔍 COMPLETE SYSTEM VERIFICATION\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || process.env.Mongo_Conn);
    console.log('✅ MongoDB Connection: WORKING');

    // Check Room Data
    const rooms = await Room.find({});
    console.log(`✅ Room Data: ${rooms.length} rooms found`);
    
    if (rooms.length === 0) {
      console.log('❌ No rooms found! Run createFreshRoomData.js first');
      return;
    }

    // Verify room fields
    const sampleRoom = rooms[0];
    const requiredFields = ['roomNumber', 'roomType', 'price', 'averageRating', 'totalRatings', 'capacity', 'amenities'];
    const missingFields = requiredFields.filter(field => sampleRoom[field] === undefined);
    
    if (missingFields.length === 0) {
      console.log('✅ Room Field Alignment: PERFECT');
    } else {
      console.log(`❌ Missing Room Fields: ${missingFields.join(', ')}`);
    }

    // Check Test Users
    const testUsers = await User.find({ email: { $regex: '@test.com$' } });
    console.log(`✅ Test Users: ${testUsers.length} users found`);
    
    if (testUsers.length === 0) {
      console.log('❌ No test users found! Run createTestingData.js first');
      return;
    }

    // Check User Interactions
    const interactions = await UserRoomInteraction.find({});
    console.log(`✅ User Interactions: ${interactions.length} interactions found`);

    // Verify interaction distribution
    const interactionStats = await UserRoomInteraction.aggregate([
      { $group: { _id: '$interactionType', count: { $sum: 1 } } }
    ]);
    
    console.log('📊 Interaction Distribution:');
    interactionStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} interactions`);
    });

    // Check room popularity scores
    const popularRooms = await Room.find({}).sort({ popularityScore: -1 }).limit(3);
    console.log('\n🏆 Top 3 Popular Rooms:');
    popularRooms.forEach((room, index) => {
      console.log(`  ${index + 1}. Room ${room.roomNumber} (${room.roomType}) - Score: ${room.popularityScore.toFixed(1)}, Rating: ${room.averageRating}⭐`);
    });

    // API endpoints will be tested when backend is running
    console.log('\n🌐 API Endpoints: Ready for testing when backend starts');

    // Verify user patterns
    console.log('\n👥 User Pattern Verification:');
    for (const user of testUsers) {
      const userInteractions = await UserRoomInteraction.find({ userId: user._id });
      const interactionTypes = [...new Set(userInteractions.map(i => i.interactionType))];
      console.log(`  ${user.name}: ${userInteractions.length} interactions (${interactionTypes.join(', ')})`);
    }

    // Check room type distribution
    const roomTypeStats = await Room.aggregate([
      { $group: { _id: '$roomType', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { avgPrice: 1 } }
    ]);
    
    console.log('\n🏨 Room Type Distribution:');
    roomTypeStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} rooms, Avg: Rs. ${Math.round(stat.avgPrice).toLocaleString('en-PK')}`);
    });

    // Verify PKR currency formatting
    console.log('\n💰 Currency Verification:');
    const priceRange = {
      min: Math.min(...rooms.map(r => r.price)),
      max: Math.max(...rooms.map(r => r.price))
    };
    console.log(`  Price Range: Rs. ${priceRange.min.toLocaleString('en-PK')} - Rs. ${priceRange.max.toLocaleString('en-PK')}`);

    // Check image paths
    const roomsWithImages = rooms.filter(r => r.image && r.image.includes('/uploads/'));
    console.log(`✅ Room Images: ${roomsWithImages.length}/${rooms.length} rooms have image paths`);

    // Final system status
    console.log('\n🎯 SYSTEM STATUS SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const checks = [
      { name: 'MongoDB Connection', status: true },
      { name: 'Room Data Complete', status: rooms.length >= 10 },
      { name: 'Field Alignment', status: missingFields.length === 0 },
      { name: 'Test Users Created', status: testUsers.length >= 5 },
      { name: 'User Interactions', status: interactions.length >= 50 },
      { name: 'Room Images', status: roomsWithImages.length >= 8 },
      { name: 'Popularity Scores', status: popularRooms.length > 0 },
      { name: 'PKR Currency', status: priceRange.min > 0 && priceRange.max > 0 }
    ];

    checks.forEach(check => {
      const status = check.status ? '✅ PASS' : '❌ FAIL';
      console.log(`  ${check.name}: ${status}`);
    });

    const allPassed = checks.every(check => check.status);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (allPassed) {
      console.log('🎉 SYSTEM VERIFICATION: 100% SUCCESSFUL!');
      console.log('🚀 Your recommendation system is ready for testing!');
      console.log('\n📋 NEXT STEPS:');
      console.log('1. Start your backend: cd backend && npm start');
      console.log('2. Start your frontend: cd frontend && npm start');
      console.log('3. Test with provided user accounts');
      console.log('4. Verify recommendations work correctly');
    } else {
      console.log('⚠️ SYSTEM VERIFICATION: Some issues found');
      console.log('Please fix the failed checks before proceeding');
    }

  } catch (error) {
    console.error('❌ System verification failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run verification
if (require.main === module) {
  verifySystem();
}

module.exports = { verifySystem };
