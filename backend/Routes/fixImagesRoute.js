const express = require('express');
const router = express.Router();
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

// Fix specific image issues
router.post('/fix-images', async (req, res) => {
  try {
    console.log('=== FIXING SPECIFIC IMAGE ISSUES ===');
    const results = [];
    
    for (const [itemName, correctImageUrl] of Object.entries(imageUpdates)) {
      try {
        const result = await Menu.updateOne(
          { name: itemName },
          { $set: { image: correctImageUrl } }
        );
        
        if (result.matchedCount > 0) {
          console.log(`✅ Updated ${itemName}: ${correctImageUrl}`);
          results.push({ item: itemName, status: 'updated', url: correctImageUrl });
        } else {
          console.log(`⚠️  Item not found: ${itemName}`);
          results.push({ item: itemName, status: 'not_found' });
        }
      } catch (error) {
        console.error(`❌ Error updating ${itemName}:`, error.message);
        results.push({ item: itemName, status: 'error', error: error.message });
      }
    }
    
    // Get updated items for verification
    const items = await Menu.find({}, 'name image');
    
    res.json({
      success: true,
      message: 'Image fixes completed',
      results,
      allItems: items.map(item => ({ name: item.name, image: item.image }))
    });
    
  } catch (error) {
    console.error('Error fixing images:', error);
    res.status(500).json({
      success: false,
      message: 'Error fixing images',
      error: error.message
    });
  }
});

module.exports = router;
