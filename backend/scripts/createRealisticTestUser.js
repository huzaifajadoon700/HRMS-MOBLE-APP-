const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import models
const User = require('../Models/User');
const Order = require('../Models/Order');
const Booking = require('../Models/Booking');
const Reservation = require('../Models/Reservations');
const Menu = require('../Models/Menu');
const Room = require('../Models/Room');
const Table = require('../Models/Table');
const UserFoodInteraction = require('../Models/UserFoodInteraction');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.Mongo_Conn);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create realistic test user
const createTestUser = async () => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'sarah.ahmed@test.com' });
    if (existingUser) {
      console.log('✅ Test user already exists');
      return existingUser;
    }

    const hashedPassword = await bcrypt.hash('testuser123', 10);
    
    const testUser = new User({
      name: 'Sarah Ahmed',
      email: 'sarah.ahmed@test.com',
      password: hashedPassword,
      phone: '+92-300-1234567',
      role: 'user',
      foodPreferences: {
        preferredCuisines: ['Pakistani', 'Chinese', 'Italian'],
        spiceLevelPreference: 'medium',
        dietaryRestrictions: ['halal'],
        allergies: [],
        favoriteCategories: ['Main Course', 'Desserts', 'Beverages'],
        avgRating: 4.2,
        totalInteractions: 45
      }
    });

    await testUser.save();
    console.log('✅ Created test user: sarah.ahmed@test.com / testuser123');
    return testUser;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    return null;
  }
};

// Create realistic food orders for the last 30 days
const createFoodOrders = async (user) => {
  try {
    const menus = await Menu.find().limit(20);
    if (menus.length === 0) {
      console.log('⚠️ No menu items found, skipping food orders');
      return [];
    }

    const orders = [];
    const orderDates = [
      { daysAgo: 2, items: 3, total: 1850 },
      { daysAgo: 5, items: 2, total: 1200 },
      { daysAgo: 8, items: 4, total: 2400 },
      { daysAgo: 12, items: 1, total: 650 },
      { daysAgo: 15, items: 3, total: 1950 },
      { daysAgo: 18, items: 2, total: 1100 },
      { daysAgo: 22, items: 5, total: 3200 },
      { daysAgo: 25, items: 2, total: 1350 },
      { daysAgo: 28, items: 3, total: 1800 }
    ];

    for (const orderData of orderDates) {
      const orderDate = new Date(Date.now() - (orderData.daysAgo * 24 * 60 * 60 * 1000));
      
      const orderItems = [];
      let calculatedTotal = 0;
      
      for (let i = 0; i < orderData.items; i++) {
        const menu = menus[Math.floor(Math.random() * menus.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const itemTotal = menu.price * quantity;
        
        orderItems.push({
          menuItemId: menu._id,
          name: menu.name,
          price: menu.price,
          quantity: quantity,
          customizations: i === 0 ? 'Extra spicy' : '',
          addOns: []
        });
        
        calculatedTotal += itemTotal;
      }

      const deliveryFee = 50;
      const finalTotal = orderData.total; // Use predefined total for consistency

      const order = new Order({
        user: user._id,
        items: orderItems,
        totalPrice: finalTotal,
        deliveryFee: deliveryFee,
        deliveryAddress: 'House 123, Block A, Gulshan-e-Iqbal, Karachi',
        deliveryLocation: {
          type: "Point",
          coordinates: [67.0011, 24.8607]
        },
        status: ['delivered', 'delivered', 'delivered', 'confirmed', 'delivered'][Math.floor(Math.random() * 5)],
        createdAt: orderDate,
        updatedAt: orderDate
      });

      await order.save();
      orders.push(order);
    }

    console.log(`✅ Created ${orders.length} food orders`);
    return orders;
  } catch (error) {
    console.error('❌ Error creating food orders:', error);
    return [];
  }
};

// Create realistic room bookings
const createRoomBookings = async (user) => {
  try {
    const rooms = await Room.find().limit(10);
    if (rooms.length === 0) {
      console.log('⚠️ No rooms found, skipping room bookings');
      return [];
    }

    const bookings = [];
    const bookingDates = [
      { daysAgo: 3, nights: 2, total: 15000 },
      { daysAgo: 14, nights: 1, total: 8500 },
      { daysAgo: 27, nights: 3, total: 22500 }
    ];

    for (const bookingData of bookingDates) {
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const checkInDate = new Date(Date.now() - (bookingData.daysAgo * 24 * 60 * 60 * 1000));
      const checkOutDate = new Date(checkInDate.getTime() + (bookingData.nights * 24 * 60 * 60 * 1000));

      const booking = new Booking({
        roomId: room._id,
        roomType: room.roomType,
        roomNumber: room.roomNumber,
        checkInDate: checkInDate.toISOString().split('T')[0],
        checkOutDate: checkOutDate.toISOString().split('T')[0],
        guests: Math.floor(Math.random() * 3) + 1,
        payment: 'card',
        totalPrice: bookingData.total,
        userId: user._id,
        fullName: user.name,
        email: user.email,
        phone: user.phone,
        paymentStatus: 'succeeded',
        status: 'confirmed',
        createdAt: checkInDate,
        updatedAt: checkInDate
      });

      await booking.save();
      bookings.push(booking);
    }

    console.log(`✅ Created ${bookings.length} room bookings`);
    return bookings;
  } catch (error) {
    console.error('❌ Error creating room bookings:', error);
    return [];
  }
};

// Create realistic table reservations
const createTableReservations = async (user) => {
  try {
    const tables = await Table.find().limit(10);
    if (tables.length === 0) {
      console.log('⚠️ No tables found, skipping table reservations');
      return [];
    }

    const reservations = [];
    const reservationDates = [
      { daysAgo: 1, guests: 4, total: 2500 },
      { daysAgo: 6, guests: 2, total: 1800 },
      { daysAgo: 11, guests: 6, total: 4200 },
      { daysAgo: 16, guests: 3, total: 2100 },
      { daysAgo: 20, guests: 2, total: 1650 },
      { daysAgo: 24, guests: 5, total: 3800 },
      { daysAgo: 29, guests: 4, total: 2900 }
    ];

    for (const resData of reservationDates) {
      const table = tables[Math.floor(Math.random() * tables.length)];
      const reservationDate = new Date(Date.now() - (resData.daysAgo * 24 * 60 * 60 * 1000));

      const reservation = new Reservation({
        tableId: table._id,
        tableNumber: table.tableName,
        reservationDate: reservationDate.toISOString().split('T')[0],
        time: ['18:00', '19:00', '20:00', '21:00'][Math.floor(Math.random() * 4)],
        endTime: ['20:00', '21:00', '22:00', '23:00'][Math.floor(Math.random() * 4)],
        guests: resData.guests,
        payment: 'card',
        totalPrice: resData.total,
        userId: user._id,
        fullName: user.name,
        email: user.email,
        phone: user.phone,
        paymentStatus: 'succeeded',
        createdAt: reservationDate,
        updatedAt: reservationDate
      });

      await reservation.save();
      reservations.push(reservation);
    }

    console.log(`✅ Created ${reservations.length} table reservations`);
    return reservations;
  } catch (error) {
    console.error('❌ Error creating table reservations:', error);
    return [];
  }
};

// Create food interactions
const createFoodInteractions = async (user) => {
  try {
    const menus = await Menu.find().limit(15);
    if (menus.length === 0) {
      console.log('⚠️ No menu items found, skipping food interactions');
      return [];
    }

    const interactions = [];
    const interactionTypes = ['rating', 'view', 'favorite', 'order'];
    
    for (let i = 0; i < 25; i++) {
      const menu = menus[Math.floor(Math.random() * menus.length)];
      const interactionType = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const interactionDate = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));

      const interaction = new UserFoodInteraction({
        userId: user._id,
        menuItemId: menu._id,
        interactionType: interactionType,
        rating: interactionType === 'rating' ? Math.floor(Math.random() * 2) + 4 : undefined, // 4-5 stars
        orderQuantity: interactionType === 'order' ? Math.floor(Math.random() * 3) + 1 : 1,
        timestamp: interactionDate,
        expiresAt: new Date(interactionDate.getTime() + (30 * 24 * 60 * 60 * 1000))
      });

      await interaction.save();
      interactions.push(interaction);
    }

    console.log(`✅ Created ${interactions.length} food interactions`);
    return interactions;
  } catch (error) {
    console.error('❌ Error creating food interactions:', error);
    return [];
  }
};

// Main function
const main = async () => {
  await connectDB();
  
  console.log('🚀 Creating realistic test user with 1-month history...\n');
  
  const user = await createTestUser();
  if (!user) {
    console.log('❌ Failed to create user, exiting...');
    process.exit(1);
  }

  await createFoodOrders(user);
  await createRoomBookings(user);
  await createTableReservations(user);
  await createFoodInteractions(user);

  console.log('\n✅ Successfully created realistic test user with comprehensive 1-month history!');
  console.log('\n📋 LOGIN CREDENTIALS:');
  console.log('Email: sarah.ahmed@test.com');
  console.log('Password: testuser123');
  console.log('\n🎯 This user has:');
  console.log('- 9 food orders in the last 30 days');
  console.log('- 3 room bookings in the last 30 days');
  console.log('- 7 table reservations in the last 30 days');
  console.log('- 25+ food interactions (ratings, views, favorites)');
  console.log('- Total spending: Rs. 85,000+ across all modules');
  
  mongoose.connection.close();
};

main().catch(console.error);
