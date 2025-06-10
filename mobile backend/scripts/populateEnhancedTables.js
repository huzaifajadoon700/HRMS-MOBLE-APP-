const mongoose = require('mongoose');
const Table = require('../Models/Table');
require('dotenv').config();

// Enhanced table data that matches our ML model structure
const enhancedTables = [
  {
    tableName: "Garden Romantic Table",
    tableType: "outdoor",
    capacity: 2,
    status: "Available",
    description: "Intimate outdoor table surrounded by beautiful garden setting, perfect for romantic dinners",
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
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&crop=center"
  },
  {
    tableName: "Executive Business Table",
    tableType: "VIP",
    capacity: 4,
    status: "Available", 
    description: "Professional dining space with privacy and excellent service for business meetings",
    location: "Private Room",
    ambiance: "Formal",
    hasWindowView: true,
    isPrivate: true,
    hasSpecialLighting: false,
    accessibilityFriendly: true,
    priceTier: "Premium",
    features: ["Window View", "Private", "VIP Service", "Wheelchair Accessible"],
    avgRating: 4.5,
    totalBookings: 314,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&crop=center"
  },
  {
    tableName: "Window View Couple Table",
    tableType: "Standard",
    capacity: 2,
    status: "Available",
    description: "Cozy table by the window with beautiful city views, ideal for intimate conversations",
    location: "Window",
    ambiance: "Intimate",
    hasWindowView: true,
    isPrivate: false,
    hasSpecialLighting: true,
    accessibilityFriendly: false,
    priceTier: "Mid-range",
    features: ["Window View", "Ambient Lighting"],
    avgRating: 4.2,
    totalBookings: 369,
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop&crop=center"
  },
  {
    tableName: "Family Celebration Table",
    tableType: "Premium",
    capacity: 8,
    status: "Available",
    description: "Spacious table perfect for family gatherings and special celebrations",
    location: "Main Hall",
    ambiance: "Social",
    hasWindowView: false,
    isPrivate: false,
    hasSpecialLighting: false,
    accessibilityFriendly: true,
    priceTier: "Mid-range",
    features: ["Wheelchair Accessible"],
    avgRating: 4.3,
    totalBookings: 180,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop&crop=center"
  },
  {
    tableName: "Terrace Sunset Table",
    tableType: "outdoor",
    capacity: 4,
    status: "Available",
    description: "Beautiful terrace table with stunning sunset views and fresh air",
    location: "Terrace",
    ambiance: "Lively",
    hasWindowView: true,
    isPrivate: false,
    hasSpecialLighting: true,
    accessibilityFriendly: false,
    priceTier: "Premium",
    features: ["Window View", "Ambient Lighting"],
    avgRating: 4.6,
    totalBookings: 319,
    image: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400&h=300&fit=crop&crop=center"
  },
  {
    tableName: "Quiet Corner Table",
    tableType: "Standard",
    capacity: 2,
    status: "Available",
    description: "Peaceful corner table away from the crowd, perfect for quiet conversations",
    location: "Corner",
    ambiance: "Quiet",
    hasWindowView: false,
    isPrivate: false,
    hasSpecialLighting: false,
    accessibilityFriendly: false,
    priceTier: "Budget",
    features: [],
    avgRating: 4.0,
    totalBookings: 237,
    image: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=400&h=300&fit=crop&crop=center"
  },
  {
    tableName: "Bar Counter Social",
    tableType: "Counter",
    capacity: 4,
    status: "Available",
    description: "Lively bar counter seating perfect for casual dining and socializing",
    location: "Bar Area",
    ambiance: "Social",
    hasWindowView: false,
    isPrivate: false,
    hasSpecialLighting: true,
    accessibilityFriendly: true,
    priceTier: "Mid-range",
    features: ["Ambient Lighting", "Wheelchair Accessible"],
    avgRating: 3.8,
    totalBookings: 180,
    image: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop&crop=center"
  },
  {
    tableName: "VIP Private Booth",
    tableType: "VIP",
    capacity: 6,
    status: "Available",
    description: "Exclusive VIP booth with premium service and complete privacy",
    location: "Private Room",
    ambiance: "Intimate",
    hasWindowView: false,
    isPrivate: true,
    hasSpecialLighting: true,
    accessibilityFriendly: true,
    priceTier: "Premium",
    features: ["Private", "VIP Service", "Ambient Lighting", "Wheelchair Accessible"],
    avgRating: 4.9,
    totalBookings: 97,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center"
  },
  {
    tableName: "Garden Party Table",
    tableType: "outdoor",
    capacity: 10,
    status: "Available",
    description: "Large outdoor table perfect for parties and group celebrations",
    location: "Garden",
    ambiance: "Lively",
    hasWindowView: false,
    isPrivate: false,
    hasSpecialLighting: true,
    accessibilityFriendly: true,
    priceTier: "Premium",
    features: ["Garden Setting", "Ambient Lighting", "Wheelchair Accessible"],
    avgRating: 4.4,
    totalBookings: 51,
    image: "https://images.unsplash.com/photo-1530062845289-9109b2ca2c39?w=400&h=300&fit=crop&crop=center"
  },
  {
    tableName: "Business Lunch Table",
    tableType: "Standard",
    capacity: 4,
    status: "Available",
    description: "Professional setting ideal for business lunches and meetings",
    location: "Main Hall",
    ambiance: "Formal",
    hasWindowView: true,
    isPrivate: false,
    hasSpecialLighting: false,
    accessibilityFriendly: true,
    priceTier: "Mid-range",
    features: ["Window View", "Wheelchair Accessible"],
    avgRating: 4.1,
    totalBookings: 425,
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop&crop=center"
  },
  {
    tableName: "Casual Friends Table",
    tableType: "Standard",
    capacity: 6,
    status: "Available",
    description: "Relaxed dining space perfect for hanging out with friends",
    location: "Main Hall",
    ambiance: "Casual",
    hasWindowView: false,
    isPrivate: false,
    hasSpecialLighting: false,
    accessibilityFriendly: false,
    priceTier: "Budget",
    features: [],
    avgRating: 3.9,
    totalBookings: 298,
    image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400&h=300&fit=crop&crop=center"
  },
  {
    tableName: "Celebration Center Table",
    tableType: "Premium",
    capacity: 12,
    status: "Available",
    description: "Grand center table perfect for large celebrations and special events",
    location: "Center",
    ambiance: "Social",
    hasWindowView: false,
    isPrivate: false,
    hasSpecialLighting: true,
    accessibilityFriendly: true,
    priceTier: "Premium",
    features: ["Ambient Lighting", "Wheelchair Accessible"],
    avgRating: 4.7,
    totalBookings: 89,
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&h=300&fit=crop&crop=center"
  }
];

const populateEnhancedTables = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');

    // Clear existing tables
    await Table.deleteMany({});
    console.log('🗑️ Cleared existing tables');

    // Insert enhanced tables
    const insertedTables = await Table.insertMany(enhancedTables);
    console.log(`✅ Successfully inserted ${insertedTables.length} enhanced tables`);

    // Display inserted tables
    console.log('\n📋 Inserted Tables:');
    insertedTables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.tableName} (${table.capacity} seats, ${table.location}, ${table.ambiance})`);
    });

    console.log('\n🎉 Enhanced table population completed successfully!');
    
  } catch (error) {
    console.error('❌ Error populating enhanced tables:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
if (require.main === module) {
  populateEnhancedTables();
}

module.exports = { populateEnhancedTables, enhancedTables };
