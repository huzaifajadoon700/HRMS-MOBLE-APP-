const mongoose = require('mongoose');
const Menu = require('../Models/Menu');

// High-quality image URLs for better management
const imageUpdates = {
  'Chicken Biryani': 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=800&h=600&fit=crop&crop=center&auto=format&q=80',
  'Mutton Karahi': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop&crop=center&auto=format&q=80',
  'Beef Nihari': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&h=600&fit=crop&crop=center&auto=format&q=80',
  'Chicken Nihari': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&h=600&fit=crop&crop=center&auto=format&q=80',
  'Chicken Haleem': 'https://images.unsplash.com/photo-1574653853027-5d3ac9b9a6e7?w=800&h=600&fit=crop&crop=center&auto=format&q=80',
  'Seekh Kebab': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop&crop=center&auto=format&q=80',
  'Chicken Pulao': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&h=600&fit=crop&crop=center&auto=format&q=80',
  'Dal Makhani': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop&crop=center&auto=format&q=80',
  'Garlic Naan': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop&crop=center&auto=format&q=80',
  'Mango Lassi': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop&crop=center&auto=format&q=80',
  'Chicken Tikka': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&h=600&fit=crop&crop=center&auto=format&q=80'
};

async function updateMenuImagesHD() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hrms');
    console.log('✅ Connected to database');
    
    console.log('\n🖼️  UPDATING MENU IMAGES TO HIGH-QUALITY URLS...\n');
    
    let successCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;
    
    for (const [itemName, imageUrl] of Object.entries(imageUpdates)) {
      try {
        const result = await Menu.updateOne(
          { name: itemName },
          { $set: { image: imageUrl } }
        );
        
        if (result.matchedCount > 0) {
          console.log(`✅ ${itemName}: Updated successfully`);
          successCount++;
        } else {
          console.log(`⚠️  ${itemName}: Item not found in database`);
          notFoundCount++;
        }
      } catch (error) {
        console.error(`❌ ${itemName}: Error - ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n📊 UPDATE SUMMARY:');
    console.log(`✅ Successfully updated: ${successCount} items`);
    console.log(`⚠️  Items not found: ${notFoundCount} items`);
    console.log(`❌ Errors: ${errorCount} items`);
    
    if (successCount > 0) {
      console.log('\n🔍 VERIFICATION - Current menu items:');
      const items = await Menu.find({}, 'name image');
      items.forEach(item => {
        const status = item.image && item.image.includes('unsplash') ? '✅' : '⚠️';
        console.log(`${status} ${item.name}: ${item.image || 'NO IMAGE'}`);
      });
    }
    
    console.log('\n🎉 Image update process completed!');
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('\n💡 Make sure your backend server is running on port 8080');
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

// Run the update
updateMenuImagesHD();
