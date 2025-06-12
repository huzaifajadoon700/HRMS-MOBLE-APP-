// scripts/seedRoomData.js
const mongoose = require('mongoose');
const Room = require('../Models/Room');
require('dotenv').config();

// Sample room data with Pakistani hotel context
const sampleRooms = [
  {
    roomNumber: '101',
    roomType: 'Single',
    description: 'Comfortable single room with modern amenities and city view. Perfect for business travelers visiting Karachi.',
    price: 4500,
    capacity: 1,
    amenities: ['WiFi', 'AC', 'TV'],
    floor: 1,
    size: 200,
    bedType: 'Single',
    averageRating: 4.2,
    totalRatings: 15,
    image: '/uploads/room-101.jpg',
    smokingAllowed: false,
    petFriendly: false
  },
  {
    roomNumber: '102',
    roomType: 'Double',
    description: 'Spacious double room perfect for couples with balcony overlooking the beautiful Karachi skyline.',
    price: 7500,
    capacity: 2,
    amenities: ['WiFi', 'AC', 'TV', 'Balcony', 'Minibar'],
    floor: 1,
    size: 300,
    bedType: 'Double',
    averageRating: 4.5,
    totalRatings: 22,
    image: '/uploads/room-102.jpg',
    smokingAllowed: false,
    petFriendly: false
  },
  {
    roomNumber: '201',
    roomType: 'Suite',
    description: 'Luxury suite with separate living area and premium amenities. Ideal for VIP guests and extended stays.',
    price: 15000,
    capacity: 4,
    amenities: ['WiFi', 'AC', 'TV', 'Balcony', 'Minibar', 'Room Service', 'Jacuzzi'],
    floor: 2,
    size: 500,
    bedType: 'King',
    averageRating: 4.8,
    totalRatings: 18,
    image: '/uploads/room-201.jpg',
    smokingAllowed: false,
    petFriendly: true
  },
  {
    roomNumber: '202',
    roomType: 'Family',
    description: 'Large family room with multiple beds and kid-friendly amenities. Perfect for Pakistani families visiting the city.',
    price: 12000,
    capacity: 6,
    amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Room Service'],
    floor: 2,
    size: 450,
    bedType: 'Twin',
    averageRating: 4.3,
    totalRatings: 25,
    image: '/uploads/room-202.jpg',
    smokingAllowed: false,
    petFriendly: true
  },
  {
    roomNumber: '301',
    roomType: 'Deluxe',
    description: 'Premium deluxe room with sea view and executive amenities. Perfect for business executives visiting Karachi.',
    price: 18000,
    capacity: 2,
    amenities: ['WiFi', 'AC', 'TV', 'Sea View', 'Minibar', 'Room Service', 'Workspace'],
    floor: 3,
    size: 400,
    bedType: 'King',
    averageRating: 4.7,
    totalRatings: 30,
    image: '/uploads/room-301.jpg',
    smokingAllowed: false,
    petFriendly: false
  },
  {
    roomNumber: '302',
    roomType: 'Twin',
    description: 'Comfortable twin room ideal for business travelers and colleagues sharing accommodation.',
    price: 8500,
    capacity: 2,
    amenities: ['WiFi', 'AC', 'TV', 'Workspace', 'City View'],
    floor: 3,
    size: 320,
    bedType: 'Twin',
    averageRating: 4.1,
    totalRatings: 12,
    image: '/uploads/room-302.jpg',
    smokingAllowed: false,
    petFriendly: false
  },
  {
    roomNumber: '401',
    roomType: 'Presidential',
    description: 'Ultimate luxury presidential suite with panoramic views of Karachi. The finest accommodation for VIP guests.',
    price: 35000,
    capacity: 8,
    amenities: ['WiFi', 'AC', 'TV', 'Sea View', 'City View', 'Minibar', 'Room Service', 'Jacuzzi', 'Kitchen', 'Workspace', 'Parking'],
    floor: 4,
    size: 800,
    bedType: 'King',
    averageRating: 4.9,
    totalRatings: 8,
    image: '/uploads/room-401.jpg',
    smokingAllowed: false,
    petFriendly: true
  },
  {
    roomNumber: '103',
    roomType: 'Double',
    description: 'Standard double room with garden view and basic amenities. Great value for money in the heart of Karachi.',
    price: 6500,
    capacity: 2,
    amenities: ['WiFi', 'AC', 'TV'],
    floor: 1,
    size: 280,
    bedType: 'Double',
    averageRating: 3.9,
    totalRatings: 20,
    image: '/uploads/room-103.jpg',
    smokingAllowed: false,
    petFriendly: false
  },
  {
    roomNumber: '203',
    roomType: 'Suite',
    description: 'Business suite with meeting area and premium facilities. Ideal for corporate guests and business meetings.',
    price: 16500,
    capacity: 4,
    amenities: ['WiFi', 'AC', 'TV', 'Workspace', 'Minibar', 'Room Service'],
    floor: 2,
    size: 520,
    bedType: 'Queen',
    averageRating: 4.6,
    totalRatings: 14,
    image: '/uploads/room-203.jpg',
    smokingAllowed: false,
    petFriendly: false
  },
  {
    roomNumber: '104',
    roomType: 'Single',
    description: 'Budget-friendly single room with essential amenities. Perfect for solo travelers exploring Karachi.',
    price: 3500,
    capacity: 1,
    amenities: ['WiFi', 'AC', 'TV'],
    floor: 1,
    size: 180,
    bedType: 'Single',
    averageRating: 3.8,
    totalRatings: 28,
    image: '/uploads/room-104.jpg',
    smokingAllowed: false,
    petFriendly: false
  }
];

async function seedRoomData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hrms');
    console.log('🔗 Connected to MongoDB');

    // Clear existing rooms to ensure fresh data
    await Room.deleteMany({});
    console.log('🗑️ Cleared existing room data');

    console.log('🌱 Seeding fresh room data with complete field alignment...');

    // Insert sample rooms
    const insertedRooms = await Room.insertMany(sampleRooms);
    console.log(`✅ Successfully seeded ${insertedRooms.length} rooms`);

    // Display summary
    console.log('\n📊 Room Summary:');
    const roomTypes = await Room.aggregate([
      { $group: { _id: '$roomType', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { avgPrice: 1 } }
    ]);

    roomTypes.forEach(type => {
      console.log(`  ${type._id}: ${type.count} rooms, Avg Price: Rs. ${Math.round(type.avgPrice)}`);
    });

    console.log('\n🎉 Room data seeding completed successfully!');
    console.log('🔗 Room recommendation system is ready to use');

  } catch (error) {
    console.error('❌ Error seeding room data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeder
if (require.main === module) {
  seedRoomData();
}

module.exports = { seedRoomData, sampleRooms };
