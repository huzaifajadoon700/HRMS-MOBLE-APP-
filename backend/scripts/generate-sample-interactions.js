const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const UserFoodInteraction = require('../Models/UserFoodInteraction');
const Menu = require('../Models/Menu');
const User = require('../Models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://mhuzaifa:mhuzaifa123@cluster0.aqcuw.mongodb.net/hrms?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function generateSampleInteractions() {
  console.log('🔄 Generating sample interaction data for evaluation...');

  try {
    // Get all menu items
    const menuItems = await Menu.find({ availability: true });
    console.log(`📋 Found ${menuItems.length} menu items`);

    if (menuItems.length === 0) {
      console.log('❌ No menu items found. Please add menu items first.');
      return;
    }

    // Get all users (or create sample users)
    let users = await User.find({ role: { $ne: 'admin' } });
    
    if (users.length === 0) {
      console.log('👥 Creating sample users...');
      const sampleUsers = [
        { name: 'John Doe', email: 'john@example.com', password: 'password123' },
        { name: 'Jane Smith', email: 'jane@example.com', password: 'password123' },
        { name: 'Ali Khan', email: 'ali@example.com', password: 'password123' },
        { name: 'Sara Ahmed', email: 'sara@example.com', password: 'password123' },
        { name: 'Mike Johnson', email: 'mike@example.com', password: 'password123' },
      ];

      for (const userData of sampleUsers) {
        try {
          const user = new User(userData);
          await user.save();
          users.push(user);
        } catch (error) {
          console.log(`⚠️ User ${userData.email} might already exist`);
        }
      }
    }

    console.log(`👥 Found/created ${users.length} users`);

    // Clear existing interactions
    await UserFoodInteraction.deleteMany({});
    console.log('🗑️ Cleared existing interactions');

    // Generate interactions for the last 30 days
    const interactions = [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Generate realistic interaction patterns
    for (const user of users) {
      const userInteractionCount = Math.floor(Math.random() * 20) + 10; // 10-30 interactions per user
      
      for (let i = 0; i < userInteractionCount; i++) {
        const randomMenuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
        
        // Generate random date within last 30 days
        const randomDate = new Date(
          thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
        );

        // Generate realistic ratings (skewed towards positive)
        let rating;
        const rand = Math.random();
        if (rand < 0.1) rating = 1;
        else if (rand < 0.2) rating = 2;
        else if (rand < 0.3) rating = 3;
        else if (rand < 0.7) rating = 4;
        else rating = 5;

        // Random interaction type
        const interactionTypes = ['view', 'order', 'rating', 'favorite'];
        const interactionType = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];

        const interaction = {
          userId: user._id,
          menuItemId: randomMenuItem._id,
          interactionType: interactionType,
          rating: ['rating', 'order'].includes(interactionType) ? rating : undefined,
          timestamp: randomDate,
          sessionId: `session_${user._id}_${i}`,
          deviceInfo: {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            platform: 'web'
          }
        };

        interactions.push(interaction);
      }
    }

    // Insert all interactions
    await UserFoodInteraction.insertMany(interactions);
    console.log(`✅ Generated ${interactions.length} sample interactions`);

    // Update menu item statistics
    console.log('📊 Updating menu item statistics...');
    for (const menuItem of menuItems) {
      const itemInteractions = interactions.filter(i => 
        i.menuItemId.toString() === menuItem._id.toString()
      );
      
      const ratings = itemInteractions
        .filter(i => i.rating)
        .map(i => i.rating);
      
      if (ratings.length > 0) {
        const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
        const totalRatings = ratings.length;
        const popularityScore = averageRating * Math.log(totalRatings + 1);

        await Menu.findByIdAndUpdate(menuItem._id, {
          averageRating: Math.round(averageRating * 100) / 100,
          totalRatings: totalRatings,
          popularityScore: Math.round(popularityScore * 100) / 100
        });
      }
    }

    console.log('✅ Updated menu item statistics');

    // Generate summary
    const summary = {
      totalInteractions: interactions.length,
      totalUsers: users.length,
      totalMenuItems: menuItems.length,
      interactionTypes: {
        view: interactions.filter(i => i.interactionType === 'view').length,
        order: interactions.filter(i => i.interactionType === 'order').length,
        rating: interactions.filter(i => i.interactionType === 'rating').length,
        favorite: interactions.filter(i => i.interactionType === 'favorite').length,
      },
      averageInteractionsPerUser: Math.round(interactions.length / users.length),
      dateRange: {
        from: thirtyDaysAgo.toISOString().split('T')[0],
        to: now.toISOString().split('T')[0]
      }
    };

    console.log('\n📊 SAMPLE DATA SUMMARY:');
    console.log('=======================');
    console.log(`Total Interactions: ${summary.totalInteractions}`);
    console.log(`Total Users: ${summary.totalUsers}`);
    console.log(`Total Menu Items: ${summary.totalMenuItems}`);
    console.log(`Average Interactions per User: ${summary.averageInteractionsPerUser}`);
    console.log(`Date Range: ${summary.dateRange.from} to ${summary.dateRange.to}`);
    console.log('\nInteraction Types:');
    Object.entries(summary.interactionTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    console.log('\n🎉 Sample interaction data generated successfully!');
    console.log('📈 Your evaluation system should now work properly!');

  } catch (error) {
    console.error('❌ Error generating sample interactions:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
generateSampleInteractions();
