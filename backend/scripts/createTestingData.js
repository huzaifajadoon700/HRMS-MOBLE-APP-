// scripts/createTestingData.js
const mongoose = require('mongoose');
const User = require('../Models/User');
const Room = require('../Models/Room');
const UserRoomInteraction = require('../Models/UserRoomInteraction');
const RoomRecommendation = require('../Models/RoomRecommendation');
const Menu = require('../Models/Menu');
const UserFoodInteraction = require('../Models/UserFoodInteraction');
const FoodRecommendation = require('../Models/FoodRecommendation');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Test users with different interaction patterns
const testUsers = [
  {
    name: 'Ahmed Khan',
    email: 'ahmed.khan@test.com',
    password: 'password123',
    role: 'user',
    preferences: ['luxury', 'business'],
    interactionPattern: 'luxury_lover' // Prefers expensive rooms and premium food
  },
  {
    name: 'Fatima Ali',
    email: 'fatima.ali@test.com',
    password: 'password123',
    role: 'user',
    preferences: ['family', 'budget'],
    interactionPattern: 'family_oriented' // Prefers family rooms and traditional food
  },
  {
    name: 'Hassan Sheikh',
    email: 'hassan.sheikh@test.com',
    password: 'password123',
    role: 'user',
    preferences: ['business', 'single'],
    interactionPattern: 'business_traveler' // Prefers single/double rooms and quick meals
  },
  {
    name: 'Ayesha Malik',
    email: 'ayesha.malik@test.com',
    password: 'password123',
    role: 'user',
    preferences: ['couple', 'romantic'],
    interactionPattern: 'couple_traveler' // Prefers double/suite rooms and fine dining
  },
  {
    name: 'New User',
    email: 'newuser@test.com',
    password: 'password123',
    role: 'user',
    preferences: [],
    interactionPattern: 'new_user' // No interaction history
  }
];

// Function to create realistic room interactions
async function createRoomInteractions(users, rooms) {
  const interactions = [];
  const now = new Date();
  
  for (const user of users) {
    if (user.interactionPattern === 'new_user') continue; // Skip new user
    
    const userDoc = await User.findOne({ email: user.email });
    if (!userDoc) continue;
    
    // Create interactions based on user pattern
    for (let i = 0; i < 15; i++) { // 15 interactions per user over last month
      const daysAgo = Math.floor(Math.random() * 30); // Random day in last month
      const interactionDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      
      let selectedRoom;
      const interactionTypes = ['view', 'view', 'view', 'booking', 'rating']; // More views than bookings
      const interactionType = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
      
      // Select room based on user pattern
      switch (user.interactionPattern) {
        case 'luxury_lover':
          selectedRoom = rooms.find(r => r.roomType === 'Presidential' || r.roomType === 'Deluxe' || r.roomType === 'Suite');
          break;
        case 'family_oriented':
          selectedRoom = rooms.find(r => r.roomType === 'Family' || (r.roomType === 'Double' && r.capacity >= 2));
          break;
        case 'business_traveler':
          selectedRoom = rooms.find(r => r.roomType === 'Single' || r.roomType === 'Double' || r.amenities.includes('Workspace'));
          break;
        case 'couple_traveler':
          selectedRoom = rooms.find(r => r.roomType === 'Double' || r.roomType === 'Suite' || r.amenities.includes('Balcony'));
          break;
        default:
          selectedRoom = rooms[Math.floor(Math.random() * rooms.length)];
      }
      
      if (!selectedRoom) selectedRoom = rooms[Math.floor(Math.random() * rooms.length)];
      
      const interaction = {
        userId: userDoc._id,
        roomId: selectedRoom._id,
        interactionType,
        rating: interactionType === 'rating' ? Math.floor(Math.random() * 2) + 4 : undefined, // 4-5 star ratings
        timestamp: interactionDate,
        groupSize: Math.floor(Math.random() * 4) + 1, // 1-4 people
        deviceType: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Add booking-specific fields if interaction is booking
      if (interactionType === 'booking') {
        const checkInDate = new Date(interactionDate);
        const bookingDuration = Math.floor(Math.random() * 5) + 1; // 1-5 days
        const checkOutDate = new Date(checkInDate.getTime() + (bookingDuration * 24 * 60 * 60 * 1000));

        interaction.checkInDate = checkInDate;
        interaction.checkOutDate = checkOutDate;
        interaction.bookingDuration = bookingDuration;
        interaction.priceAtInteraction = selectedRoom.price;
      }
      
      interactions.push(interaction);
    }
  }
  
  return interactions;
}

// Function to create realistic food interactions
async function createFoodInteractions(users, menuItems) {
  const interactions = [];
  const now = new Date();
  
  for (const user of users) {
    if (user.interactionPattern === 'new_user') continue; // Skip new user
    
    const userDoc = await User.findOne({ email: user.email });
    if (!userDoc) continue;
    
    // Create food interactions based on user pattern
    for (let i = 0; i < 20; i++) { // 20 food interactions per user
      const daysAgo = Math.floor(Math.random() * 30);
      const interactionDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      
      let selectedFood;
      const interactionTypes = ['view', 'view', 'order', 'rating'];
      const interactionType = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
      
      // Select food based on user pattern
      switch (user.interactionPattern) {
        case 'luxury_lover':
          selectedFood = menuItems.find(f => f.price > 1500 || f.category === 'Main Course');
          break;
        case 'family_oriented':
          selectedFood = menuItems.find(f => f.name.includes('Biryani') || f.name.includes('Karahi') || f.category === 'Pakistani');
          break;
        case 'business_traveler':
          selectedFood = menuItems.find(f => f.category === 'Fast Food' || f.category === 'Beverages');
          break;
        case 'couple_traveler':
          selectedFood = menuItems.find(f => f.category === 'Desserts' || f.category === 'Main Course');
          break;
        default:
          selectedFood = menuItems[Math.floor(Math.random() * menuItems.length)];
      }
      
      if (!selectedFood) selectedFood = menuItems[Math.floor(Math.random() * menuItems.length)];
      
      const interaction = {
        userId: userDoc._id,
        foodId: selectedFood._id,
        interactionType,
        rating: interactionType === 'rating' ? Math.floor(Math.random() * 2) + 4 : undefined,
        timestamp: interactionDate,
        quantity: interactionType === 'order' ? Math.floor(Math.random() * 3) + 1 : 1, // 1-3 items for orders
        deviceType: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      interactions.push(interaction);
    }
  }
  
  return interactions;
}

async function createTestingData() {
  try {
    console.log('🧪 Creating Comprehensive Testing Data...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || process.env.Mongo_Conn);
    console.log('🔗 Connected to MongoDB');

    // Clear existing test users and interactions
    console.log('🗑️ Clearing existing test data...');
    await User.deleteMany({ email: { $in: testUsers.map(u => u.email) } });
    await UserRoomInteraction.deleteMany({});
    await RoomRecommendation.deleteMany({});
    await UserFoodInteraction.deleteMany({});
    await FoodRecommendation.deleteMany({});
    console.log('✅ Cleared existing test data');

    // Create test users
    console.log('👥 Creating test users...');
    const createdUsers = [];
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role
      });
      await user.save();
      createdUsers.push({ ...userData, _id: user._id });
      console.log(`  ✅ Created user: ${userData.name} (${userData.interactionPattern})`);
    }

    // Get rooms and menu items
    const rooms = await Room.find({});
    const menuItems = await Menu.find({});
    
    console.log(`📊 Found ${rooms.length} rooms and ${menuItems.length} menu items`);

    // Create room interactions
    console.log('🏨 Creating room interactions...');
    const roomInteractions = await createRoomInteractions(createdUsers, rooms);
    if (roomInteractions.length > 0) {
      await UserRoomInteraction.insertMany(roomInteractions);
      console.log(`  ✅ Created ${roomInteractions.length} room interactions`);
    }

    // Create food interactions (only if menu items exist)
    if (menuItems.length > 0) {
      console.log('🍽️ Creating food interactions...');
      const foodInteractions = await createFoodInteractions(createdUsers, menuItems);
      if (foodInteractions.length > 0) {
        await UserFoodInteraction.insertMany(foodInteractions);
        console.log(`  ✅ Created ${foodInteractions.length} food interactions`);
      }
    } else {
      console.log('⚠️ No menu items found, skipping food interactions');
    }

    // Display user interaction summary
    console.log('\n📊 User Interaction Summary:');
    for (const user of createdUsers) {
      const userDoc = await User.findOne({ email: user.email });
      const roomInteractionCount = await UserRoomInteraction.countDocuments({ userId: userDoc._id });
      const foodInteractionCount = await UserFoodInteraction.countDocuments({ userId: userDoc._id });
      
      console.log(`  ${user.name}:`);
      console.log(`    Pattern: ${user.interactionPattern}`);
      console.log(`    Room Interactions: ${roomInteractionCount}`);
      console.log(`    Food Interactions: ${foodInteractionCount}`);
      console.log(`    Email: ${user.email} | Password: password123`);
      console.log('');
    }

    console.log('🎯 Testing Scenarios Created:');
    console.log('  ✅ Luxury Lover - Prefers expensive rooms and premium food');
    console.log('  ✅ Family Oriented - Prefers family rooms and traditional Pakistani food');
    console.log('  ✅ Business Traveler - Prefers single rooms and quick meals');
    console.log('  ✅ Couple Traveler - Prefers romantic rooms and fine dining');
    console.log('  ✅ New User - No interaction history (will see popular items)');

    console.log('\n🎉 Testing Data Creation Complete!');
    console.log('🚀 Your recommendation systems are ready for comprehensive testing!');

  } catch (error) {
    console.error('❌ Error creating testing data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  createTestingData();
}

module.exports = { createTestingData };
