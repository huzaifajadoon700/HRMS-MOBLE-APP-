const mongoose = require('mongoose');
const MenuItem = require('../Models/Menu');

async function checkImages() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hrms');
    console.log('Connected to database');
    
    const items = await MenuItem.find({}, 'name image');
    console.log('\n=== MENU ITEMS AND THEIR IMAGES ===');
    
    items.forEach(item => {
      console.log(`${item.name}: ${item.image}`);
    });
    
    console.log(`\nTotal items: ${items.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

checkImages();
