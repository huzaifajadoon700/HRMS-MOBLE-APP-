const mongoose = require('mongoose');
const Room = require('../Models/Room');
require('dotenv').config();

// Enhanced room data - adding 10 more rooms to make total 20
const additionalRooms = [
  {
    roomNumber: '201',
    roomType: 'Deluxe',
    description: 'Spacious deluxe room with panoramic city view, marble bathroom, and premium amenities. Perfect for luxury travelers.',
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
    description: 'Executive suite with separate living area, premium furnishing, and exclusive concierge service.',
    price: 18000,
    capacity: 4,
    amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Sea View', 'Room Service', 'Jacuzzi', 'Kitchen'],
    floor: 2,
    size: 600,
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
    roomNumber: '301',
    roomType: 'Presidential',
    description: 'Luxurious presidential suite with private terrace, butler service, and exclusive amenities.',
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
    roomNumber: '105',
    roomType: 'Family',
    description: 'Spacious family room with connecting doors, child-friendly amenities, and entertainment center.',
    price: 8500,
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
    roomNumber: '106',
    roomType: 'Twin',
    description: 'Comfortable twin room with two single beds, ideal for friends or colleagues traveling together.',
    price: 6000,
    capacity: 2,
    amenities: ['WiFi', 'AC', 'TV', 'Workspace'],
    floor: 1,
    size: 300,
    bedType: 'Twin',
    averageRating: 4.2,
    totalRatings: 78,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=400&fit=crop',
    smokingAllowed: false,
    petFriendly: false,
    popularityScore: 75,
    totalBookings: 145
  },
  {
    roomNumber: '203',
    roomType: 'Double',
    description: 'Modern double room with garden view, comfortable seating area, and work desk.',
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
    roomNumber: '204',
    roomType: 'Deluxe',
    description: 'Premium deluxe room with balcony, upgraded amenities, and personalized service.',
    price: 13500,
    capacity: 3,
    amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony', 'City View', 'Room Service', 'Jacuzzi'],
    floor: 2,
    size: 450,
    bedType: 'Queen',
    averageRating: 4.6,
    totalRatings: 71,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=500&h=400&fit=crop',
    smokingAllowed: false,
    petFriendly: false,
    popularityScore: 85,
    totalBookings: 123
  },
  {
    roomNumber: '107',
    roomType: 'Single',
    description: 'Cozy single room with modern amenities, perfect for solo business travelers.',
    price: 4800,
    capacity: 1,
    amenities: ['WiFi', 'AC', 'TV', 'Workspace'],
    floor: 1,
    size: 220,
    bedType: 'Single',
    averageRating: 4.1,
    totalRatings: 56,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=400&fit=crop',
    smokingAllowed: false,
    petFriendly: false,
    popularityScore: 72,
    totalBookings: 189
  },
  {
    roomNumber: '302',
    roomType: 'Suite',
    description: 'Luxury suite with panoramic views, separate dining area, and premium entertainment system.',
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
  },
  {
    roomNumber: '108',
    roomType: 'Family',
    description: 'Large family room with bunk beds, play area, and family-friendly amenities.',
    price: 9200,
    capacity: 8,
    amenities: ['WiFi', 'AC', 'TV', 'Room Service', 'Kitchen'],
    floor: 1,
    size: 550,
    bedType: 'Twin',
    averageRating: 4.3,
    totalRatings: 128,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&h=400&fit=crop',
    smokingAllowed: false,
    petFriendly: true,
    popularityScore: 80,
    totalBookings: 176
  }
];

async function enhanceRoomData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.Mongo_Conn || 'mongodb://localhost:27017/hrms');
    console.log('🔗 Connected to MongoDB');

    // Check current room count
    const currentCount = await Room.countDocuments();
    console.log(`📊 Current rooms in database: ${currentCount}`);

    // Add new rooms
    const insertedRooms = await Room.insertMany(additionalRooms);
    console.log(`✅ Successfully added ${insertedRooms.length} new rooms`);

    // Display final count
    const finalCount = await Room.countDocuments();
    console.log(`📊 Total rooms now: ${finalCount}`);

    // Display room types summary
    const roomTypes = await Room.aggregate([
      { $group: { _id: '$roomType', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { avgPrice: 1 } }
    ]);

    console.log('\n📋 Room Types Summary:');
    roomTypes.forEach(type => {
      console.log(`  ${type._id}: ${type.count} rooms, Avg Price: Rs. ${Math.round(type.avgPrice)}`);
    });

    console.log('\n🎉 Room data enhancement completed successfully!');
    
  } catch (error) {
    console.error('❌ Error enhancing room data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  enhanceRoomData();
}

module.exports = { enhanceRoomData, additionalRooms };
