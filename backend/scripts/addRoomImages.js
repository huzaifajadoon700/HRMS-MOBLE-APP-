// scripts/addRoomImages.js
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Room images from Unsplash (high-quality hotel room images)
const roomImages = [
  {
    filename: 'room-101.jpg',
    url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop&crop=center',
    description: 'Single Room - Modern and comfortable'
  },
  {
    filename: 'room-102.jpg',
    url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&fit=crop&crop=center',
    description: 'Double Room with Balcony - Elegant design'
  },
  {
    filename: 'room-103.jpg',
    url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop&crop=center',
    description: 'Standard Double Room - Budget friendly'
  },
  {
    filename: 'room-104.jpg',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center',
    description: 'Budget Single Room - Clean and simple'
  },
  {
    filename: 'room-201.jpg',
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&crop=center',
    description: 'Luxury Suite - Premium amenities'
  },
  {
    filename: 'room-202.jpg',
    url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&crop=center',
    description: 'Family Room - Spacious and kid-friendly'
  },
  {
    filename: 'room-203.jpg',
    url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop&crop=center',
    description: 'Business Suite - Professional environment'
  },
  {
    filename: 'room-301.jpg',
    url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop&crop=center',
    description: 'Deluxe Room with Sea View - Executive level'
  },
  {
    filename: 'room-302.jpg',
    url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop&crop=center',
    description: 'Twin Room - Perfect for business travelers'
  },
  {
    filename: 'room-401.jpg',
    url: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&h=600&fit=crop&crop=center',
    description: 'Presidential Suite - Ultimate luxury'
  }
];

// Function to download image from URL
const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const filePath = path.join(uploadsDir, filename);
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Choose http or https based on URL
    const client = url.startsWith('https') ? https : http;
    
    const file = fs.createWriteStream(filePath);
    
    client.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${filename}`);
          resolve(filePath);
        });
        
        file.on('error', (err) => {
          fs.unlink(filePath, () => {}); // Delete the file on error
          reject(err);
        });
      } else {
        reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
};

// Function to create placeholder images if download fails
const createPlaceholderImage = (filename) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const filePath = path.join(uploadsDir, filename);
  
  // Create a simple text file as placeholder
  const placeholderContent = `Placeholder for ${filename}`;
  fs.writeFileSync(filePath.replace('.jpg', '.txt'), placeholderContent);
  console.log(`📝 Created placeholder for: ${filename}`);
};

// Main function to download all room images
async function downloadRoomImages() {
  console.log('🏨 Starting room image download process...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const image of roomImages) {
    try {
      console.log(`📥 Downloading ${image.filename}...`);
      await downloadImage(image.url, image.filename);
      successCount++;
      
      // Add a small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to download ${image.filename}:`, error.message);
      createPlaceholderImage(image.filename);
      failCount++;
    }
  }
  
  console.log('\n🎉 Room image download process completed!');
  console.log(`✅ Successfully downloaded: ${successCount} images`);
  console.log(`❌ Failed downloads: ${failCount} images`);
  
  if (failCount > 0) {
    console.log('\n💡 Note: Failed images have placeholder files created.');
    console.log('You can manually add room images to the uploads folder with these names:');
    roomImages.forEach(img => {
      console.log(`   - ${img.filename} (${img.description})`);
    });
  }
  
  console.log('\n📁 All room images should now be available in: backend/uploads/');
  console.log('🚀 Your room recommendation system is ready with images!');
}

// Alternative function to copy existing images if available
function copyExistingImages() {
  console.log('🔍 Checking for existing room-like images in uploads...');
  
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const files = fs.readdirSync(uploadsDir);
  
  // Find images that could be used as room images
  const imageFiles = files.filter(file => 
    file.toLowerCase().match(/\.(jpg|jpeg|png)$/) && 
    !file.includes('menu') && 
    !file.includes('table')
  );
  
  console.log(`Found ${imageFiles.length} potential room images`);
  
  if (imageFiles.length >= 10) {
    // Use existing images for rooms
    roomImages.forEach((room, index) => {
      if (imageFiles[index]) {
        const sourcePath = path.join(uploadsDir, imageFiles[index]);
        const targetPath = path.join(uploadsDir, room.filename);
        
        try {
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`✅ Copied ${imageFiles[index]} → ${room.filename}`);
        } catch (error) {
          console.error(`❌ Failed to copy ${imageFiles[index]}:`, error.message);
        }
      }
    });
    
    console.log('\n🎉 Room images created from existing uploads!');
    return true;
  }
  
  return false;
}

// Run the script
if (require.main === module) {
  console.log('🏨 Room Image Setup Script\n');
  
  // First try to use existing images
  const usedExisting = copyExistingImages();
  
  if (!usedExisting) {
    // If not enough existing images, download new ones
    console.log('\n📥 Not enough existing images, downloading new ones...\n');
    downloadRoomImages().catch(error => {
      console.error('❌ Error in download process:', error);
      process.exit(1);
    });
  }
}

module.exports = { downloadRoomImages, copyExistingImages };
