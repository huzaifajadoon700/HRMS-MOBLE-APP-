const mongoose = require('mongoose');
const Room = require('../Models/Room');
const Table = require('../Models/Table');
const Menu = require('../Models/Menu');
require('dotenv').config();

// Additional Rooms (10 more to make total 20)
const additionalRooms = [
  {
    roomNumber: '201',
    roomType: 'Deluxe',
    description: 'Spacious deluxe room with panoramic city view, marble bathroom, and premium amenities.',
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

// Additional Tables (10 more to make total 20)
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
  }
];

// Additional Menu Items (15 more to make total 25+ across all categories)
const additionalMenuItems = [
  // Appetizers (5 more)
  {
    name: "Chicken Samosa",
    description: "Crispy triangular pastries filled with spiced chicken and vegetables",
    price: 180,
    category: "Appetizers",
    availability: true,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&h=400&fit=crop",
    ingredients: ["chicken", "onions", "peas", "pastry", "spices"],
    cuisine: "Pakistani",
    spiceLevel: "medium",
    dietaryTags: ["halal"],
    preparationTime: 20,
    nutritionalInfo: { calories: 150, protein: 8, carbs: 18, fat: 6 },
    averageRating: 4.2,
    totalRatings: 85,
    popularityScore: 70,
    isRecommended: false
  },
  {
    name: "Aloo Tikki",
    description: "Spiced potato patties served with mint and tamarind chutney",
    price: 120,
    category: "Appetizers",
    availability: true,
    image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&h=400&fit=crop",
    ingredients: ["potatoes", "onions", "green chilies", "coriander", "spices"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["vegetarian", "vegan", "halal"],
    preparationTime: 15,
    nutritionalInfo: { calories: 120, protein: 3, carbs: 22, fat: 3 },
    averageRating: 4.0,
    totalRatings: 62,
    popularityScore: 65,
    isRecommended: false
  },
  {
    name: "Fish Pakora",
    description: "Crispy fish fritters marinated in spices and gram flour batter",
    price: 280,
    category: "Appetizers",
    availability: true,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=400&fit=crop",
    ingredients: ["fish", "gram flour", "ginger", "garlic", "red chili"],
    cuisine: "Pakistani",
    spiceLevel: "hot",
    dietaryTags: ["halal"],
    preparationTime: 25,
    nutritionalInfo: { calories: 220, protein: 18, carbs: 12, fat: 12 },
    averageRating: 4.3,
    totalRatings: 47,
    popularityScore: 68,
    isRecommended: false
  },
  {
    name: "Vegetable Spring Rolls",
    description: "Crispy rolls filled with fresh vegetables and served with sweet chili sauce",
    price: 200,
    category: "Appetizers",
    availability: true,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=400&fit=crop",
    ingredients: ["cabbage", "carrots", "bell peppers", "spring roll wrapper"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["vegetarian", "vegan", "halal"],
    preparationTime: 20,
    nutritionalInfo: { calories: 140, protein: 4, carbs: 20, fat: 5 },
    averageRating: 3.9,
    totalRatings: 53,
    popularityScore: 60,
    isRecommended: false
  },
  {
    name: "Chicken Wings",
    description: "Spicy grilled chicken wings with Pakistani masala seasoning",
    price: 350,
    category: "Appetizers",
    availability: true,
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&h=400&fit=crop",
    ingredients: ["chicken wings", "yogurt", "red chili", "garam masala", "lemon"],
    cuisine: "Pakistani",
    spiceLevel: "hot",
    dietaryTags: ["halal"],
    preparationTime: 30,
    nutritionalInfo: { calories: 280, protein: 25, carbs: 2, fat: 18 },
    averageRating: 4.4,
    totalRatings: 76,
    popularityScore: 75,
    isRecommended: true
  },

  // Beverages (5 more)
  {
    name: "Fresh Lime Water",
    description: "Refreshing lime juice with mint and a hint of black salt",
    price: 80,
    category: "Beverages",
    availability: true,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&h=400&fit=crop",
    ingredients: ["lime", "mint", "black salt", "water", "sugar"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["vegetarian", "vegan", "halal"],
    preparationTime: 3,
    nutritionalInfo: { calories: 25, protein: 0, carbs: 7, fat: 0 },
    averageRating: 4.1,
    totalRatings: 94,
    popularityScore: 55,
    isRecommended: false
  },
  {
    name: "Kashmiri Chai",
    description: "Traditional pink tea with cardamom, cinnamon, and almonds",
    price: 120,
    category: "Beverages",
    availability: true,
    image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=500&h=400&fit=crop",
    ingredients: ["green tea", "milk", "cardamom", "cinnamon", "almonds"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["vegetarian", "halal"],
    preparationTime: 10,
    nutritionalInfo: { calories: 90, protein: 3, carbs: 12, fat: 3 },
    averageRating: 4.5,
    totalRatings: 67,
    popularityScore: 72,
    isRecommended: true
  },
  {
    name: "Rooh Afza",
    description: "Traditional rose-flavored drink with milk and ice",
    price: 100,
    category: "Beverages",
    availability: true,
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&h=400&fit=crop",
    ingredients: ["rooh afza syrup", "milk", "ice", "rose water"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["vegetarian", "halal"],
    preparationTime: 5,
    nutritionalInfo: { calories: 110, protein: 4, carbs: 20, fat: 2 },
    averageRating: 4.0,
    totalRatings: 58,
    popularityScore: 50,
    isRecommended: false
  },
  {
    name: "Sugarcane Juice",
    description: "Fresh sugarcane juice with ginger and lemon",
    price: 90,
    category: "Beverages",
    availability: true,
    image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=500&h=400&fit=crop",
    ingredients: ["sugarcane", "ginger", "lemon", "ice"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["vegetarian", "vegan", "halal"],
    preparationTime: 5,
    nutritionalInfo: { calories: 80, protein: 0, carbs: 20, fat: 0 },
    averageRating: 3.8,
    totalRatings: 42,
    popularityScore: 48,
    isRecommended: false
  },
  {
    name: "Doodh Patti",
    description: "Strong milk tea boiled with tea leaves and spices",
    price: 60,
    category: "Beverages",
    availability: true,
    image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=500&h=400&fit=crop",
    ingredients: ["tea leaves", "milk", "sugar", "cardamom"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["vegetarian", "halal"],
    preparationTime: 8,
    nutritionalInfo: { calories: 70, protein: 3, carbs: 10, fat: 2 },
    averageRating: 4.2,
    totalRatings: 89,
    popularityScore: 65,
    isRecommended: false
  },

  // Desserts (5 more)
  {
    name: "Gulab Jamun",
    description: "Soft milk dumplings soaked in rose-flavored sugar syrup",
    price: 180,
    category: "Desserts",
    availability: true,
    image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=500&h=400&fit=crop",
    ingredients: ["milk powder", "flour", "sugar", "rose water", "cardamom"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["vegetarian", "halal"],
    preparationTime: 30,
    nutritionalInfo: { calories: 250, protein: 6, carbs: 45, fat: 8 },
    averageRating: 4.6,
    totalRatings: 112,
    popularityScore: 85,
    isRecommended: true
  },
  {
    name: "Kheer",
    description: "Creamy rice pudding with cardamom, almonds, and pistachios",
    price: 150,
    category: "Desserts",
    availability: true,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=400&fit=crop",
    ingredients: ["rice", "milk", "sugar", "cardamom", "almonds", "pistachios"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["vegetarian", "halal"],
    preparationTime: 45,
    nutritionalInfo: { calories: 200, protein: 8, carbs: 35, fat: 5 },
    averageRating: 4.3,
    totalRatings: 78,
    popularityScore: 70,
    isRecommended: false
  },
  {
    name: "Ras Malai",
    description: "Soft cottage cheese dumplings in sweetened milk with pistachios",
    price: 220,
    category: "Desserts",
    availability: true,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=400&fit=crop",
    ingredients: ["cottage cheese", "milk", "sugar", "cardamom", "pistachios"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["vegetarian", "halal"],
    preparationTime: 40,
    nutritionalInfo: { calories: 280, protein: 12, carbs: 35, fat: 10 },
    averageRating: 4.7,
    totalRatings: 95,
    popularityScore: 88,
    isRecommended: true
  },
  {
    name: "Kulfi",
    description: "Traditional Pakistani ice cream with cardamom and pistachios",
    price: 120,
    category: "Desserts",
    availability: true,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&h=400&fit=crop",
    ingredients: ["milk", "sugar", "cardamom", "pistachios", "almonds"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["vegetarian", "halal"],
    preparationTime: 15,
    nutritionalInfo: { calories: 160, protein: 6, carbs: 20, fat: 6 },
    averageRating: 4.4,
    totalRatings: 86,
    popularityScore: 75,
    isRecommended: true
  },
  {
    name: "Shahi Tukda",
    description: "Royal bread pudding with rabri, nuts, and silver leaf",
    price: 200,
    category: "Desserts",
    availability: true,
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&h=400&fit=crop",
    ingredients: ["bread", "milk", "sugar", "cardamom", "almonds", "silver leaf"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["vegetarian", "halal"],
    preparationTime: 35,
    nutritionalInfo: { calories: 320, protein: 10, carbs: 50, fat: 12 },
    averageRating: 4.5,
    totalRatings: 64,
    popularityScore: 78,
    isRecommended: true
  }
];

async function enhanceAllData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.Mongo_Conn || 'mongodb://localhost:27017/hrms');
    console.log('🔗 Connected to MongoDB');

    console.log('\n=== ENHANCING DATABASE WITH MORE DATA ===\n');

    // 1. Enhance Rooms
    console.log('📊 Current room count:', await Room.countDocuments());
    const insertedRooms = await Room.insertMany(additionalRooms);
    console.log(`✅ Added ${insertedRooms.length} new rooms`);
    console.log('📊 Total rooms now:', await Room.countDocuments());

    // 2. Enhance Tables
    console.log('\n📊 Current table count:', await Table.countDocuments());
    const insertedTables = await Table.insertMany(additionalTables);
    console.log(`✅ Added ${insertedTables.length} new tables`);
    console.log('📊 Total tables now:', await Table.countDocuments());

    // 3. Enhance Menu Items
    console.log('\n📊 Current menu count:', await Menu.countDocuments());
    const insertedMenuItems = await Menu.insertMany(additionalMenuItems);
    console.log(`✅ Added ${insertedMenuItems.length} new menu items`);
    console.log('📊 Total menu items now:', await Menu.countDocuments());

    // Display category breakdown
    const menuCategories = await Menu.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📋 Menu Categories Summary:');
    menuCategories.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} items`);
    });

    console.log('\n🎉 Database enhancement completed successfully!');
    
  } catch (error) {
    console.error('❌ Error enhancing data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  enhanceAllData();
}

module.exports = { enhanceAllData, additionalRooms, additionalTables, additionalMenuItems };
