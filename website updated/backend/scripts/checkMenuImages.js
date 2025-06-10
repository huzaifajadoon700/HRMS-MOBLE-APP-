const axios = require('axios');

async function checkMenuImages() {
  try {
    console.log('Fetching menu items from API...');
    const response = await axios.get('http://localhost:8080/api/menus');
    const menuItems = response.data;
    
    console.log('\n=== MENU ITEMS AND THEIR IMAGES ===');
    console.log(`Total items: ${menuItems.length}\n`);
    
    menuItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name}`);
      console.log(`   Image: ${item.image || 'NO IMAGE'}`);
      console.log(`   ID: ${item._id}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error fetching menu items:', error.message);
  }
}

checkMenuImages();
