const mongoose = require('mongoose');
const Table = require('../Models/Table');
require('dotenv').config();

// Enhanced table data - adding 10 more tables to make total 20
const additionalTables = [
  {
    tableName: "Executive Boardroom Table",
    tableType: "private",
    capacity: 8,
    status: "Available",
    description: "Premium private dining table perfect for business meetings and corporate events",
    location: "Private Room",
    ambiance: "Formal",
    hasWindowView: false,
    isPrivate: true,
    hasSpecialLighting: true,
    accessibilityFriendly: true,
    priceTier: "Premium",
    features: ["Private", "Business Setup", "Presentation Screen", "Sound System"],
    avgRating: 4.9,
    totalBookings: 145,
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop"
  },
  {
    tableName: "Rooftop Terrace Table",
    tableType: "outdoor",
    capacity: 4,
    status: "Available",
    description: "Stunning rooftop table with panoramic city views and open-air dining experience",
    location: "Terrace",
    ambiance: "Lively",
    hasWindowView: true,
    isPrivate: false,
    hasSpecialLighting: true,
    accessibilityFriendly: false,
    priceTier: "Premium",
    features: ["City View", "Open Air", "Sunset Views", "Instagram Worthy"],
    avgRating: 4.8,
    totalBookings: 267,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop"
  },
  {
    tableName: "Chef's Counter Seat",
    tableType: "Counter",
    capacity: 2,
    status: "Available",
    description: "Interactive dining experience at the chef's counter with live cooking demonstration",
    location: "Bar Area",
    ambiance: "Social",
    hasWindowView: false,
    isPrivate: false,
    hasSpecialLighting: true,
    accessibilityFriendly: true,
    priceTier: "Premium",
    features: ["Chef Interaction", "Live Cooking", "Premium Experience"],
    avgRating: 4.7,
    totalBookings: 189,
    image: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400&h=300&fit=crop"
  },
  {
    tableName: "Family Celebration Table",
    tableType: "Standard",
    capacity: 10,
    status: "Available",
    description: "Large family table perfect for celebrations, birthdays, and special occasions",
    location: "Main Hall",
    ambiance: "Social",
    hasWindowView: false,
    isPrivate: false,
    hasSpecialLighting: false,
    accessibilityFriendly: true,
    priceTier: "Mid-range",
    features: ["Large Group", "Celebration Setup", "Party Decorations"],
    avgRating: 4.5,
    totalBookings: 234,
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=300&fit=crop"
  },
  {
    tableName: "Quiet Study Corner",
    tableType: "Standard",
    capacity: 2,
    status: "Available",
    description: "Peaceful corner table ideal for quiet conversations, work meetings, or study sessions",
    location: "Corner",
    ambiance: "Quiet",
    hasWindowView: true,
    isPrivate: false,
    hasSpecialLighting: false,
    accessibilityFriendly: true,
    priceTier: "Budget",
    features: ["Quiet Zone", "WiFi", "Power Outlets", "Natural Light"],
    avgRating: 4.3,
    totalBookings: 156,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop"
  },
  {
    tableName: "Wine Tasting Booth",
    tableType: "Booth",
    capacity: 4,
    status: "Available",
    description: "Cozy booth with wine storage and tasting setup for wine enthusiasts",
    location: "Bar Area",
    ambiance: "Intimate",
    hasWindowView: false,
    isPrivate: true,
    hasSpecialLighting: true,
    accessibilityFriendly: false,
    priceTier: "Premium",
    features: ["Wine Storage", "Tasting Setup", "Sommelier Service"],
    avgRating: 4.6,
    totalBookings: 178,
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop"
  },
  {
    tableName: "Garden Pavilion Table",
    tableType: "outdoor",
    capacity: 6,
    status: "Available",
    description: "Beautiful garden pavilion table surrounded by lush greenery and flowers",
    location: "Garden",
    ambiance: "Romantic",
    hasWindowView: false,
    isPrivate: true,
    hasSpecialLighting: true,
    accessibilityFriendly: true,
    priceTier: "Premium",
    features: ["Garden Setting", "Pavilion Cover", "Floral Decor", "Nature Views"],
    avgRating: 4.9,
    totalBookings: 198,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
  },
  {
    tableName: "Sports Viewing Table",
    tableType: "Standard",
    capacity: 6,
    status: "Available",
    description: "Perfect table for watching sports with multiple TV screens and casual atmosphere",
    location: "Main Hall",
    ambiance: "Lively",
    hasWindowView: false,
    isPrivate: false,
    hasSpecialLighting: false,
    accessibilityFriendly: true,
    priceTier: "Mid-range",
    features: ["Multiple TVs", "Sports Package", "Casual Dining", "Group Friendly"],
    avgRating: 4.2,
    totalBookings: 289,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
  },
  {
    tableName: "Fireplace Cozy Table",
    tableType: "Standard",
    capacity: 4,
    status: "Available",
    description: "Warm and cozy table next to the fireplace, perfect for winter dining",
    location: "Corner",
    ambiance: "Intimate",
    hasWindowView: false,
    isPrivate: false,
    hasSpecialLighting: true,
    accessibilityFriendly: true,
    priceTier: "Mid-range",
    features: ["Fireplace View", "Cozy Atmosphere", "Warm Lighting"],
    avgRating: 4.7,
    totalBookings: 167,
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop"
  },
  {
    tableName: "Business Lunch Table",
    tableType: "Standard",
    capacity: 4,
    status: "Available",
    description: "Professional setting ideal for business lunches and client meetings",
    location: "Main Hall",
    ambiance: "Formal",
    hasWindowView: true,
    isPrivate: false,
    hasSpecialLighting: false,
    accessibilityFriendly: true,
    priceTier: "Mid-range",
    features: ["Business Friendly", "WiFi", "Quiet Zone", "Professional Setting"],
    avgRating: 4.4,
    totalBookings: 223,
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop"
  }
];

async function enhanceTableData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.Mongo_Conn || 'mongodb://localhost:27017/hrms');
    console.log('🔗 Connected to MongoDB');

    // Check current table count
    const currentCount = await Table.countDocuments();
    console.log(`📊 Current tables in database: ${currentCount}`);

    // Add new tables
    const insertedTables = await Table.insertMany(additionalTables);
    console.log(`✅ Successfully added ${insertedTables.length} new tables`);

    // Display final count
    const finalCount = await Table.countDocuments();
    console.log(`📊 Total tables now: ${finalCount}`);

    // Display table types summary
    const tableTypes = await Table.aggregate([
      { $group: { _id: '$tableType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📋 Table Types Summary:');
    tableTypes.forEach(type => {
      console.log(`  ${type._id}: ${type.count} tables`);
    });

    // Display ambiance summary
    const ambianceTypes = await Table.aggregate([
      { $group: { _id: '$ambiance', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n🎭 Ambiance Types Summary:');
    ambianceTypes.forEach(type => {
      console.log(`  ${type._id}: ${type.count} tables`);
    });

    console.log('\n🎉 Table data enhancement completed successfully!');
    
  } catch (error) {
    console.error('❌ Error enhancing table data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  enhanceTableData();
}

module.exports = { enhanceTableData, additionalTables };
