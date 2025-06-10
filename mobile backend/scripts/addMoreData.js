const mongoose = require('mongoose');
const Room = require('../Models/Room');
const Table = require('../Models/Table');
const Menu = require('../Models/Menu');
require('dotenv').config();

// Additional 10 rooms to reach 20 total
const moreRooms = [
  {
    roomNumber: '204',
    roomType: 'Deluxe',
    description: 'Premium deluxe room with balcony and upgraded amenities.',
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
    roomNumber: '205',
    roomType: 'Single',
    description: 'Cozy single room with modern amenities for solo travelers.',
    price: 4800,
    capacity: 1,
    amenities: ['WiFi', 'AC', 'TV', 'Workspace'],
    floor: 2,
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
    roomNumber: '206',
    roomType: 'Family',
    description: 'Large family room with bunk beds and play area.',
    price: 9200,
    capacity: 8,
    amenities: ['WiFi', 'AC', 'TV', 'Room Service', 'Kitchen'],
    floor: 2,
    size: 550,
    bedType: 'Twin',
    averageRating: 4.3,
    totalRatings: 128,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&h=400&fit=crop',
    smokingAllowed: false,
    petFriendly: true,
    popularityScore: 80,
    totalBookings: 176
  },
  {
    roomNumber: '303',
    roomType: 'Twin',
    description: 'Modern twin room with workspace and city views.',
    price: 6500,
    capacity: 2,
    amenities: ['WiFi', 'AC', 'TV', 'Workspace', 'City View'],
    floor: 3,
    size: 320,
    bedType: 'Twin',
    averageRating: 4.2,
    totalRatings: 45,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=400&fit=crop',
    smokingAllowed: false,
    petFriendly: false,
    popularityScore: 76,
    totalBookings: 98
  },
  {
    roomNumber: '304',
    roomType: 'Double',
    description: 'Elegant double room with premium furnishing.',
    price: 8000,
    capacity: 2,
    amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Room Service'],
    floor: 3,
    size: 380,
    bedType: 'Double',
    averageRating: 4.4,
    totalRatings: 67,
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=500&h=400&fit=crop',
    smokingAllowed: false,
    petFriendly: false,
    popularityScore: 81,
    totalBookings: 143
  },
  {
    roomNumber: '401',
    roomType: 'Suite',
    description: 'Penthouse suite with panoramic views and luxury amenities.',
    price: 25000,
    capacity: 4,
    amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony', 'Sea View', 'Room Service', 'Jacuzzi', 'Kitchen', 'Workspace'],
    floor: 4,
    size: 800,
    bedType: 'King',
    averageRating: 4.9,
    totalRatings: 34,
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=500&h=400&fit=crop',
    smokingAllowed: false,
    petFriendly: true,
    popularityScore: 93,
    totalBookings: 76
  },
  {
    roomNumber: '402',
    roomType: 'Deluxe',
    description: 'Top floor deluxe room with stunning views.',
    price: 14000,
    capacity: 2,
    amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony', 'Sea View', 'Room Service'],
    floor: 4,
    size: 420,
    bedType: 'King',
    averageRating: 4.7,
    totalRatings: 52,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=500&h=400&fit=crop',
    smokingAllowed: false,
    petFriendly: false,
    popularityScore: 87,
    totalBookings: 109
  },
  {
    roomNumber: '403',
    roomType: 'Family',
    description: 'Premium family suite with multiple bedrooms.',
    price: 15000,
    capacity: 10,
    amenities: ['WiFi', 'AC', 'TV', 'Room Service', 'Kitchen', 'Balcony'],
    floor: 4,
    size: 700,
    bedType: 'Twin',
    averageRating: 4.5,
    totalRatings: 89,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&h=400&fit=crop',
    smokingAllowed: false,
    petFriendly: true,
    popularityScore: 84,
    totalBookings: 156
  },
  {
    roomNumber: '404',
    roomType: 'Single',
    description: 'Premium single room with panoramic city views.',
    price: 5500,
    capacity: 1,
    amenities: ['WiFi', 'AC', 'TV', 'City View', 'Workspace'],
    floor: 4,
    size: 250,
    bedType: 'Single',
    averageRating: 4.3,
    totalRatings: 38,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=400&fit=crop',
    smokingAllowed: false,
    petFriendly: false,
    popularityScore: 74,
    totalBookings: 87
  },
  {
    roomNumber: '405',
    roomType: 'Presidential',
    description: 'Ultimate presidential suite with private elevator and butler service.',
    price: 45000,
    capacity: 8,
    amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony', 'Sea View', 'Room Service', 'Jacuzzi', 'Kitchen', 'Workspace', 'Parking'],
    floor: 4,
    size: 1200,
    bedType: 'King',
    averageRating: 5.0,
    totalRatings: 15,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&h=400&fit=crop',
    smokingAllowed: false,
    petFriendly: true,
    popularityScore: 99,
    totalBookings: 28
  }
];

// Additional 18 tables to reach 20 total
const moreTables = [
  {
    tableName: "Wine Tasting Booth",
    tableType: "Booth",
    capacity: 4,
    status: "Available",
    description: "Cozy booth with wine storage and tasting setup",
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
    description: "Beautiful garden pavilion table surrounded by lush greenery",
    location: "Garden",
    ambiance: "Romantic",
    hasWindowView: false,
    isPrivate: true,
    hasSpecialLighting: true,
    accessibilityFriendly: true,
    priceTier: "Premium",
    features: ["Garden Setting", "Pavilion Cover", "Floral Decor"],
    avgRating: 4.9,
    totalBookings: 198,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
  },
  {
    tableName: "Sports Viewing Table",
    tableType: "Standard",
    capacity: 6,
    status: "Available",
    description: "Perfect table for watching sports with multiple TV screens",
    location: "Main Hall",
    ambiance: "Lively",
    hasWindowView: false,
    isPrivate: false,
    hasSpecialLighting: false,
    accessibilityFriendly: true,
    priceTier: "Mid-range",
    features: ["Multiple TVs", "Sports Package", "Casual Dining"],
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
    features: ["Business Friendly", "WiFi", "Quiet Zone"],
    avgRating: 4.4,
    totalBookings: 223,
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop"
  },
  {
    tableName: "Rooftop Terrace Table",
    tableType: "outdoor",
    capacity: 4,
    status: "Available",
    description: "Stunning rooftop table with panoramic city views",
    location: "Terrace",
    ambiance: "Lively",
    hasWindowView: true,
    isPrivate: false,
    hasSpecialLighting: true,
    accessibilityFriendly: false,
    priceTier: "Premium",
    features: ["City View", "Open Air", "Sunset Views"],
    avgRating: 4.8,
    totalBookings: 267,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop"
  },
  {
    tableName: "Chef's Counter Seat",
    tableType: "Counter",
    capacity: 2,
    status: "Available",
    description: "Interactive dining experience at the chef's counter",
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
    description: "Large family table perfect for celebrations and special occasions",
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
    description: "Peaceful corner table ideal for quiet conversations",
    location: "Corner",
    ambiance: "Quiet",
    hasWindowView: true,
    isPrivate: false,
    hasSpecialLighting: false,
    accessibilityFriendly: true,
    priceTier: "Budget",
    features: ["Quiet Zone", "WiFi", "Power Outlets"],
    avgRating: 4.3,
    totalBookings: 156,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop"
  },
  {
    tableName: "VIP Private Dining",
    tableType: "VIP",
    capacity: 6,
    status: "Available",
    description: "Exclusive VIP dining room with personalized service",
    location: "Private Room",
    ambiance: "Formal",
    hasWindowView: false,
    isPrivate: true,
    hasSpecialLighting: true,
    accessibilityFriendly: true,
    priceTier: "Premium",
    features: ["VIP Service", "Private", "Exclusive"],
    avgRating: 4.9,
    totalBookings: 98,
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop"
  },
  {
    tableName: "Poolside Cabana",
    tableType: "outdoor",
    capacity: 4,
    status: "Available",
    description: "Relaxing poolside table with cabana shade",
    location: "Terrace",
    ambiance: "Casual",
    hasWindowView: false,
    isPrivate: true,
    hasSpecialLighting: false,
    accessibilityFriendly: true,
    priceTier: "Premium",
    features: ["Pool View", "Cabana", "Relaxing"],
    avgRating: 4.6,
    totalBookings: 178,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
  },
  {
    tableName: "Library Reading Table",
    tableType: "Standard",
    capacity: 2,
    status: "Available",
    description: "Quiet table in library setting perfect for reading and work",
    location: "Corner",
    ambiance: "Quiet",
    hasWindowView: true,
    isPrivate: false,
    hasSpecialLighting: false,
    accessibilityFriendly: true,
    priceTier: "Budget",
    features: ["Library Setting", "Quiet", "Work Friendly"],
    avgRating: 4.1,
    totalBookings: 134,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop"
  },
  {
    tableName: "Sunset Balcony Table",
    tableType: "outdoor",
    capacity: 3,
    status: "Available",
    description: "Perfect table for watching sunset with panoramic views",
    location: "Terrace",
    ambiance: "Romantic",
    hasWindowView: true,
    isPrivate: false,
    hasSpecialLighting: true,
    accessibilityFriendly: false,
    priceTier: "Premium",
    features: ["Sunset View", "Romantic", "Panoramic"],
    avgRating: 4.8,
    totalBookings: 201,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop"
  },
  {
    tableName: "Game Night Table",
    tableType: "Standard",
    capacity: 6,
    status: "Available",
    description: "Fun table setup perfect for game nights and casual gatherings",
    location: "Main Hall",
    ambiance: "Lively",
    hasWindowView: false,
    isPrivate: false,
    hasSpecialLighting: false,
    accessibilityFriendly: true,
    priceTier: "Mid-range",
    features: ["Game Setup", "Fun Atmosphere", "Group Friendly"],
    avgRating: 4.3,
    totalBookings: 189,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
  },
  {
    tableName: "Brunch Special Table",
    tableType: "Standard",
    capacity: 4,
    status: "Available",
    description: "Perfect table for weekend brunch with natural lighting",
    location: "Window",
    ambiance: "Casual",
    hasWindowView: true,
    isPrivate: false,
    hasSpecialLighting: false,
    accessibilityFriendly: true,
    priceTier: "Mid-range",
    features: ["Natural Light", "Brunch Setup", "Weekend Special"],
    avgRating: 4.4,
    totalBookings: 167,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop"
  },
  {
    tableName: "Anniversary Special Table",
    tableType: "Premium",
    capacity: 2,
    status: "Available",
    description: "Romantic table setup perfect for anniversaries and special occasions",
    location: "Garden",
    ambiance: "Romantic",
    hasWindowView: false,
    isPrivate: true,
    hasSpecialLighting: true,
    accessibilityFriendly: true,
    priceTier: "Premium",
    features: ["Romantic Setup", "Special Occasions", "Private"],
    avgRating: 4.9,
    totalBookings: 145,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
  },
  {
    tableName: "Corporate Meeting Table",
    tableType: "Premium",
    capacity: 8,
    status: "Available",
    description: "Professional table setup for corporate meetings and presentations",
    location: "Private Room",
    ambiance: "Formal",
    hasWindowView: false,
    isPrivate: true,
    hasSpecialLighting: true,
    accessibilityFriendly: true,
    priceTier: "Premium",
    features: ["Corporate Setup", "Presentation Ready", "Professional"],
    avgRating: 4.7,
    totalBookings: 123,
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop"
  },
  {
    tableName: "Casual Hangout Table",
    tableType: "Standard",
    capacity: 5,
    status: "Available",
    description: "Relaxed table perfect for casual hangouts with friends",
    location: "Main Hall",
    ambiance: "Casual",
    hasWindowView: false,
    isPrivate: false,
    hasSpecialLighting: false,
    accessibilityFriendly: true,
    priceTier: "Budget",
    features: ["Casual Setup", "Friend Gatherings", "Relaxed"],
    avgRating: 4.2,
    totalBookings: 198,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop"
  }
];

// Additional menu items to reach 25+ total
const moreMenuItems = [
  // More Appetizers
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
  // More Beverages
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
  // Desserts
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
  // More Main Course
  {
    name: "Lamb Karahi",
    description: "Tender lamb cooked in traditional karahi with aromatic spices",
    price: 750,
    category: "Main Course",
    availability: true,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&h=400&fit=crop",
    ingredients: ["lamb", "tomatoes", "green chilies", "ginger", "garlic"],
    cuisine: "Pakistani",
    spiceLevel: "hot",
    dietaryTags: ["halal"],
    preparationTime: 70,
    nutritionalInfo: { calories: 480, protein: 38, carbs: 8, fat: 32 },
    averageRating: 4.7,
    totalRatings: 92,
    popularityScore: 89,
    isRecommended: true
  },
  {
    name: "Vegetable Biryani",
    description: "Aromatic basmati rice with mixed vegetables and traditional spices",
    price: 350,
    category: "Main Course",
    availability: true,
    image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=500&h=400&fit=crop",
    ingredients: ["basmati rice", "mixed vegetables", "saffron", "yogurt", "spices"],
    cuisine: "Pakistani",
    spiceLevel: "medium",
    dietaryTags: ["vegetarian", "vegan", "halal"],
    preparationTime: 40,
    nutritionalInfo: { calories: 380, protein: 12, carbs: 68, fat: 8 },
    averageRating: 4.4,
    totalRatings: 76,
    popularityScore: 78,
    isRecommended: true
  },
  // More Bread
  {
    name: "Butter Naan",
    description: "Soft, fluffy bread brushed with butter and baked in tandoor",
    price: 100,
    category: "Bread",
    availability: true,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&h=400&fit=crop",
    ingredients: ["flour", "yogurt", "butter", "yeast"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["vegetarian", "halal"],
    preparationTime: 12,
    nutritionalInfo: { calories: 160, protein: 5, carbs: 28, fat: 4 },
    averageRating: 4.1,
    totalRatings: 89,
    popularityScore: 65,
    isRecommended: false
  },
  {
    name: "Cheese Naan",
    description: "Naan stuffed with melted cheese and herbs",
    price: 150,
    category: "Bread",
    availability: true,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&h=400&fit=crop",
    ingredients: ["flour", "cheese", "yogurt", "herbs", "butter"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["vegetarian", "halal"],
    preparationTime: 15,
    nutritionalInfo: { calories: 220, protein: 9, carbs: 30, fat: 8 },
    averageRating: 4.3,
    totalRatings: 67,
    popularityScore: 72,
    isRecommended: false
  },
  {
    name: "Tandoori Roti",
    description: "Whole wheat bread baked in tandoor oven",
    price: 60,
    category: "Bread",
    availability: true,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&h=400&fit=crop",
    ingredients: ["whole wheat flour", "water", "salt"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["vegetarian", "vegan", "halal"],
    preparationTime: 8,
    nutritionalInfo: { calories: 120, protein: 4, carbs: 24, fat: 1 },
    averageRating: 3.9,
    totalRatings: 54,
    popularityScore: 58,
    isRecommended: false
  },
  // More Beverages
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
    name: "Chicken Shawarma",
    description: "Grilled chicken wrapped in fresh naan with vegetables and sauce",
    price: 320,
    category: "Main Course",
    availability: true,
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&h=400&fit=crop",
    ingredients: ["chicken", "naan", "vegetables", "yogurt sauce", "spices"],
    cuisine: "Pakistani",
    spiceLevel: "medium",
    dietaryTags: ["halal"],
    preparationTime: 25,
    nutritionalInfo: { calories: 420, protein: 32, carbs: 35, fat: 18 },
    averageRating: 4.5,
    totalRatings: 94,
    popularityScore: 82,
    isRecommended: true
  }
];

async function addMoreData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.Mongo_Conn || 'mongodb://localhost:27017/hrms');
    console.log('🔗 Connected to MongoDB');

    console.log('\n=== ADDING MORE DATA TO REACH TARGETS ===\n');

    // Check current counts
    const currentRooms = await Room.countDocuments();
    const currentTables = await Table.countDocuments();
    const currentMenu = await Menu.countDocuments();

    console.log('📊 Current Counts:');
    console.log(`   Rooms: ${currentRooms}`);
    console.log(`   Tables: ${currentTables}`);
    console.log(`   Menu Items: ${currentMenu}`);

    // Add more rooms
    if (currentRooms < 20) {
      const roomsToAdd = moreRooms.slice(0, 20 - currentRooms);
      const insertedRooms = await Room.insertMany(roomsToAdd);
      console.log(`✅ Added ${insertedRooms.length} more rooms`);
    }

    // Add more tables
    if (currentTables < 20) {
      const tablesToAdd = moreTables.slice(0, 20 - currentTables);
      const insertedTables = await Table.insertMany(tablesToAdd);
      console.log(`✅ Added ${insertedTables.length} more tables`);
    }

    // Add more menu items
    if (currentMenu < 25) {
      const menuToAdd = moreMenuItems.slice(0, 25 - currentMenu);
      const insertedMenu = await Menu.insertMany(menuToAdd);
      console.log(`✅ Added ${insertedMenu.length} more menu items`);
    }

    // Final counts
    const finalRooms = await Room.countDocuments();
    const finalTables = await Table.countDocuments();
    const finalMenu = await Menu.countDocuments();

    console.log('\n📊 Final Counts:');
    console.log(`   Rooms: ${finalRooms} (Target: 20+) ${finalRooms >= 20 ? '✅' : '❌'}`);
    console.log(`   Tables: ${finalTables} (Target: 20+) ${finalTables >= 20 ? '✅' : '❌'}`);
    console.log(`   Menu Items: ${finalMenu} (Target: 25+) ${finalMenu >= 25 ? '✅' : '❌'}`);

    console.log('\n🎉 Data enhancement completed!');

  } catch (error) {
    console.error('❌ Error adding more data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  addMoreData();
}

module.exports = { addMoreData };
