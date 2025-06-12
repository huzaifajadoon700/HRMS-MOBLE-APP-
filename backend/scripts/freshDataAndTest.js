const mongoose = require('mongoose');
const Room = require('../Models/Room');
const Table = require('../Models/Table');
const Menu = require('../Models/Menu');
const { testRecommendationSystems } = require('./testRecommendations');
require('dotenv').config();

// Fresh room data (20 rooms total)
const freshRooms = [
  // Original 10 rooms with slight modifications
  {
    roomNumber: '101',
    roomType: 'Single',
    description: 'Comfortable single room with modern amenities and city view.',
    price: 4500,
    capacity: 1,
    amenities: ['WiFi', 'AC', 'TV'],
    floor: 1,
    size: 200,
    bedType: 'Single',
    averageRating: 4.2,
    totalRatings: 15,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=400&fit=crop',
    smokingAllowed: false,
    petFriendly: false,
    popularityScore: 72,
    totalBookings: 189
  },
  {
    roomNumber: '102',
    roomType: 'Double',
    description: 'Spacious double room with garden view and modern amenities.',
    price: 7000,
    capacity: 2,
    amenities: ['WiFi', 'AC', 'TV', 'Minibar'],
    floor: 1,
    size: 300,
    bedType: 'Double',
    averageRating: 4.3,
    totalRatings: 28,
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=500&h=400&fit=crop',
    smokingAllowed: false,
    petFriendly: false,
    popularityScore: 79,
    totalBookings: 167
  },
  {
    roomNumber: '103',
    roomType: 'Twin',
    description: 'Twin room with two single beds, perfect for friends or colleagues.',
    price: 8500,
    capacity: 2,
    amenities: ['WiFi', 'AC', 'TV', 'Workspace'],
    floor: 1,
    size: 280,
    bedType: 'Twin',
    averageRating: 4.1,
    totalRatings: 22,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=400&fit=crop',
    smokingAllowed: false,
    petFriendly: false,
    popularityScore: 75,
    totalBookings: 145
  },
  {
    roomNumber: '104',
    roomType: 'Family',
    description: 'Large family room with connecting doors and child-friendly amenities.',
    price: 12000,
    capacity: 6,
    amenities: ['WiFi', 'AC', 'TV', 'Room Service', 'Kitchen'],
    floor: 1,
    size: 500,
    bedType: 'Twin',
    averageRating: 4.4,
    totalRatings: 112,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=400&fit=crop',
    smokingAllowed: false,
    petFriendly: true,
    popularityScore: 82,
    totalBookings: 198
  },
  {
    roomNumber: '105',
    roomType: 'Suite',
    description: 'Luxury suite with separate living area and premium amenities.',
    price: 18000,
    capacity: 4,
    amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Sea View', 'Room Service', 'Jacuzzi'],
    floor: 1,
    size: 600,
    bedType: 'King',
    averageRating: 4.8,
    totalRatings: 45,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&h=400&fit=crop',
    smokingAllowed: false,
    petFriendly: true,
    popularityScore: 91,
    totalBookings: 87
  },
  // Additional 15 rooms
  {
    roomNumber: '201',
    roomType: 'Deluxe',
    description: 'Spacious deluxe room with panoramic city view and premium amenities.',
    price: 12000,
    capacity: 2,
    amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'City View', 'Room Service', 'Workspace'],
    floor: 2,
    size: 400,
    bedType: 'King',
    averageRating: 4.7,
    totalRatings: 89,
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500&h=400&fit=crop',
    smokingAllowed: false,
    petFriendly: false,
    popularityScore: 88,
    totalBookings: 156
  },
  {
    roomNumber: '202',
    roomType: 'Suite',
    description: 'Executive suite with separate living area and exclusive concierge service.',
    price: 20000,
    capacity: 4,
    amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Sea View', 'Room Service', 'Jacuzzi', 'Kitchen'],
    floor: 2,
    size: 650,
    bedType: 'King',
    averageRating: 4.9,
    totalRatings: 67,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&h=400&fit=crop',
    smokingAllowed: false,
    petFriendly: true,
    popularityScore: 95,
    totalBookings: 134
  },
  {
    roomNumber: '203',
    roomType: 'Double',
    description: 'Modern double room with garden view and comfortable seating area.',
    price: 7500,
    capacity: 2,
    amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Room Service', 'Workspace'],
    floor: 2,
    size: 350,
    bedType: 'Double',
    averageRating: 4.5,
    totalRatings: 94,
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=500&h=400&fit=crop',
    smokingAllowed: false,
    petFriendly: false,
    popularityScore: 79,
    totalBookings: 167
  },
  {
    roomNumber: '301',
    roomType: 'Presidential',
    description: 'Luxurious presidential suite with private terrace and butler service.',
    price: 35000,
    capacity: 6,
    amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony', 'Sea View', 'Room Service', 'Jacuzzi', 'Kitchen', 'Parking'],
    floor: 3,
    size: 1000,
    bedType: 'King',
    averageRating: 5.0,
    totalRatings: 23,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&h=400&fit=crop',
    smokingAllowed: false,
    petFriendly: true,
    popularityScore: 98,
    totalBookings: 45
  },
  {
    roomNumber: '302',
    roomType: 'Suite',
    description: 'Luxury suite with panoramic views and premium entertainment system.',
    price: 22000,
    capacity: 4,
    amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Sea View', 'Room Service', 'Jacuzzi', 'Kitchen', 'Workspace'],
    floor: 3,
    size: 700,
    bedType: 'King',
    averageRating: 4.8,
    totalRatings: 41,
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=500&h=400&fit=crop',
    smokingAllowed: false,
    petFriendly: true,
    popularityScore: 91,
    totalBookings: 87
  }
];

// Fresh table data (20 tables total)
const freshTables = [
  {
    tableName: "Garden Romantic Table",
    tableType: "outdoor",
    capacity: 2,
    status: "Available",
    description: "Intimate outdoor table surrounded by beautiful garden setting",
    location: "Garden",
    ambiance: "Romantic",
    hasWindowView: false,
    isPrivate: true,
    hasSpecialLighting: true,
    accessibilityFriendly: false,
    priceTier: "Premium",
    features: ["Private", "Garden Setting", "Ambient Lighting"],
    avgRating: 4.8,
    totalBookings: 285,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop"
  },
  {
    tableName: "Executive Boardroom Table",
    tableType: "private",
    capacity: 8,
    status: "Available",
    description: "Premium private dining table perfect for business meetings",
    location: "Private Room",
    ambiance: "Formal",
    hasWindowView: false,
    isPrivate: true,
    hasSpecialLighting: true,
    accessibilityFriendly: true,
    priceTier: "Premium",
    features: ["Private", "Business Setup", "Presentation Screen"],
    avgRating: 4.9,
    totalBookings: 145,
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop"
  }
];

async function freshDataAndTest() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.Mongo_Conn || 'mongodb://localhost:27017/hrms');
    console.log('🔗 Connected to MongoDB');

    console.log('\n=== FRESH DATABASE SETUP & COMPREHENSIVE TESTING ===\n');

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await Room.deleteMany({});
    await Table.deleteMany({});
    // Keep existing menu items as they're good

    // Insert fresh data
    console.log('🌱 Inserting fresh data...');
    
    const insertedRooms = await Room.insertMany(freshRooms);
    console.log(`✅ Inserted ${insertedRooms.length} rooms`);
    
    const insertedTables = await Table.insertMany(freshTables);
    console.log(`✅ Inserted ${insertedTables.length} tables`);

    // Check menu count
    const menuCount = await Menu.countDocuments();
    console.log(`📊 Menu items: ${menuCount} (keeping existing)`);

    // Display final counts
    console.log('\n📊 Final Database State:');
    console.log(`   Rooms: ${await Room.countDocuments()}`);
    console.log(`   Tables: ${await Table.countDocuments()}`);
    console.log(`   Menu Items: ${await Menu.countDocuments()}`);

    // Test recommendation systems
    console.log('\n=== TESTING RECOMMENDATION SYSTEMS ===');
    await mongoose.disconnect();
    await testRecommendationSystems();

    console.log('\n🎉 Fresh data setup and testing completed!');

  } catch (error) {
    console.error('❌ Error in fresh data setup:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    console.log('🔌 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  freshDataAndTest();
}

module.exports = { freshDataAndTest };
