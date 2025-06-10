const mongoose = require('mongoose');
const Menu = require('../Models/Menu');

// Correct image URLs for specific items
const imageUpdates = {
  'Chicken Biryani': 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=500&h=400&fit=crop&crop=center',
  'Beef Nihari': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&h=400&fit=crop&crop=center',
  'Chicken Nihari': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&h=400&fit=crop&crop=center',
  'Mango Lassi': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&h=400&fit=crop&crop=center',
  'Mutton Karahi': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&h=400&fit=crop&crop=center',
  'Chicken Haleem': 'https://images.unsplash.com/photo-1574653853027-5d3ac9b9a6e7?w=500&h=400&fit=crop&crop=center',
  'Seekh Kebab': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&h=400&fit=crop&crop=center',
  'Chicken Pulao': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&h=400&fit=crop&crop=center',
  'Dal Makhani': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=400&fit=crop&crop=center',
  'Garlic Naan': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&h=400&fit=crop&crop=center',
  'Chicken Tikka': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&h=400&fit=crop&crop=center'
};

async function fixSpecificImages() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hrms');
    console.log('Connected to database');
    
    console.log('\n=== FIXING SPECIFIC IMAGE ISSUES ===');
    
    for (const [itemName, correctImageUrl] of Object.entries(imageUpdates)) {
      try {
        const result = await Menu.updateOne(
          { name: itemName },
          { $set: { image: correctImageUrl } }
        );
        
        if (result.matchedCount > 0) {
          console.log(`✅ Updated ${itemName}: ${correctImageUrl}`);
        } else {
          console.log(`⚠️  Item not found: ${itemName}`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${itemName}:`, error.message);
      }
    }
    
    console.log('\n=== VERIFICATION ===');
    const items = await Menu.find({}, 'name image');
    items.forEach(item => {
      console.log(`${item.name}: ${item.image}`);
    });
    
    console.log('\n✅ Image fixes completed!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

fixSpecificImages();
