const mongoose = require('mongoose');
const Menu = require('../Models/Menu');
require('dotenv').config();

const sampleMenuItems = [
  {
    name: "Chicken Biryani",
    description: "Aromatic basmati rice cooked with tender chicken pieces, traditional spices, and saffron",
    price: 450,
    category: "Main Course",
    availability: true,
    image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=500&h=400&fit=crop&crop=center",
    ingredients: ["basmati rice", "chicken", "saffron", "yogurt", "onions", "garam masala"],
    cuisine: "Pakistani",
    spiceLevel: "medium",
    dietaryTags: ["halal"],
    preparationTime: 45,
    nutritionalInfo: {
      calories: 520,
      protein: 28,
      carbs: 65,
      fat: 15
    },
    averageRating: 4.8,
    totalRatings: 156,
    popularityScore: 95,
    isRecommended: true
  },
  {
    name: "Mutton Karahi",
    description: "Tender mutton cooked in traditional karahi with tomatoes, green chilies, and aromatic spices",
    price: 650,
    category: "Main Course",
    availability: true,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&h=400&fit=crop&crop=center",
    ingredients: ["mutton", "tomatoes", "green chilies", "ginger", "garlic", "coriander"],
    cuisine: "Pakistani",
    spiceLevel: "hot",
    dietaryTags: ["halal"],
    preparationTime: 60,
    nutritionalInfo: {
      calories: 420,
      protein: 35,
      carbs: 12,
      fat: 28
    },
    averageRating: 4.7,
    totalRatings: 89,
    popularityScore: 88,
    isRecommended: true
  },
  {
    name: "Beef Nihari",
    description: "Slow-cooked beef stew with traditional spices, served with naan and garnished with ginger",
    price: 550,
    category: "Main Course",
    availability: true,
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&h=400&fit=crop&crop=center",
    ingredients: ["beef", "wheat flour", "garam masala", "ginger", "fried onions"],
    cuisine: "Pakistani",
    spiceLevel: "medium",
    dietaryTags: ["halal"],
    preparationTime: 120,
    nutritionalInfo: {
      calories: 480,
      protein: 32,
      carbs: 18,
      fat: 32
    },
    averageRating: 4.6,
    totalRatings: 67,
    popularityScore: 82,
    isRecommended: true
  },
  {
    name: "Chicken Haleem",
    description: "Hearty lentil and chicken stew slow-cooked to perfection with aromatic spices",
    price: 380,
    category: "Main Course",
    availability: true,
    image: "https://images.unsplash.com/photo-1574653853027-5d3ac9b9a6e7?w=500&h=400&fit=crop&crop=center",
    ingredients: ["chicken", "lentils", "wheat", "barley", "garam masala", "mint"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["halal"],
    preparationTime: 90,
    nutritionalInfo: {
      calories: 350,
      protein: 25,
      carbs: 35,
      fat: 12
    },
    averageRating: 4.5,
    totalRatings: 78,
    popularityScore: 75,
    isRecommended: true
  },
  {
    name: "Seekh Kebab",
    description: "Grilled minced meat skewers seasoned with traditional Pakistani spices",
    price: 320,
    category: "Appetizers",
    availability: true,
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&h=400&fit=crop&crop=center",
    ingredients: ["minced beef", "onions", "green chilies", "coriander", "cumin", "red chili"],
    cuisine: "Pakistani",
    spiceLevel: "hot",
    dietaryTags: ["halal"],
    preparationTime: 25,
    nutritionalInfo: {
      calories: 280,
      protein: 22,
      carbs: 5,
      fat: 18
    },
    averageRating: 4.4,
    totalRatings: 92,
    popularityScore: 78,
    isRecommended: false
  },
  {
    name: "Chicken Pulao",
    description: "Fragrant rice dish cooked with chicken, whole spices, and caramelized onions",
    price: 350,
    category: "Main Course",
    availability: true,
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&h=400&fit=crop&crop=center",
    ingredients: ["basmati rice", "chicken", "whole spices", "fried onions", "yogurt"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["halal"],
    preparationTime: 40,
    nutritionalInfo: {
      calories: 420,
      protein: 24,
      carbs: 55,
      fat: 12
    },
    averageRating: 4.3,
    totalRatings: 54,
    popularityScore: 68,
    isRecommended: false
  },
  {
    name: "Dal Makhani",
    description: "Creamy black lentils slow-cooked with butter, cream, and aromatic spices",
    price: 280,
    category: "Main Course",
    availability: true,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=400&fit=crop&crop=center",
    ingredients: ["black lentils", "kidney beans", "butter", "cream", "tomatoes", "garam masala"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["vegetarian", "halal"],
    preparationTime: 60,
    nutritionalInfo: {
      calories: 320,
      protein: 18,
      carbs: 42,
      fat: 8
    },
    averageRating: 4.1,
    totalRatings: 43,
    popularityScore: 62,
    isRecommended: false
  },
  {
    name: "Garlic Naan",
    description: "Soft, fluffy bread topped with fresh garlic and herbs, baked in tandoor",
    price: 120,
    category: "Bread",
    availability: true,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&h=400&fit=crop&crop=center",
    ingredients: ["flour", "yogurt", "garlic", "coriander", "butter"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["vegetarian", "halal"],
    preparationTime: 15,
    nutritionalInfo: {
      calories: 180,
      protein: 6,
      carbs: 32,
      fat: 4
    },
    averageRating: 4.0,
    totalRatings: 67,
    popularityScore: 58,
    isRecommended: false
  },
  {
    name: "Mango Lassi",
    description: "Refreshing yogurt-based drink blended with sweet mango pulp and cardamom",
    price: 150,
    category: "Beverages",
    availability: true,
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&h=400&fit=crop&crop=center",
    ingredients: ["yogurt", "mango pulp", "sugar", "cardamom", "ice"],
    cuisine: "Pakistani",
    spiceLevel: "mild",
    dietaryTags: ["vegetarian", "halal"],
    preparationTime: 5,
    nutritionalInfo: {
      calories: 120,
      protein: 4,
      carbs: 24,
      fat: 2
    },
    averageRating: 3.9,
    totalRatings: 38,
    popularityScore: 45,
    isRecommended: false
  },
  {
    name: "Chicken Tikka",
    description: "Marinated chicken pieces grilled to perfection with yogurt and spices",
    price: 420,
    category: "Appetizers",
    availability: true,
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&h=400&fit=crop&crop=center",
    ingredients: ["chicken", "yogurt", "lemon juice", "garam masala", "red chili", "ginger"],
    cuisine: "Pakistani",
    spiceLevel: "medium",
    dietaryTags: ["halal"],
    preparationTime: 30,
    nutritionalInfo: {
      calories: 250,
      protein: 28,
      carbs: 3,
      fat: 14
    },
    averageRating: 4.2,
    totalRatings: 71,
    popularityScore: 72,
    isRecommended: false
  }
];

async function populateMenuData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.Mongo_Conn);
    console.log('✅ Connected to MongoDB');

    // Clear existing menu items
    await Menu.deleteMany({});
    console.log('🗑️ Cleared existing menu items');

    // Insert new menu items
    const insertedItems = await Menu.insertMany(sampleMenuItems);
    console.log(`✅ Inserted ${insertedItems.length} menu items with recommendation fields`);

    // Display inserted items
    console.log('\n📋 INSERTED MENU ITEMS:');
    insertedItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - Rs.${item.price}`);
      console.log(`   🌶️ Spice: ${item.spiceLevel} | ⭐ Rating: ${item.averageRating} | 🔥 Popularity: ${item.popularityScore}`);
      console.log(`   🏷️ Tags: ${item.dietaryTags.join(', ')} | ⏱️ Time: ${item.preparationTime}min`);
      console.log('');
    });

    console.log('🎉 Menu data population completed successfully!');
    
  } catch (error) {
    console.error('❌ Error populating menu data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  populateMenuData();
}

module.exports = { populateMenuData, sampleMenuItems };
