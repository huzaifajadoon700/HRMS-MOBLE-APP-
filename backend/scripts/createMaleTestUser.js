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
const UserRoomInteraction = require('../Models/UserRoomInteraction');

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

// Create realistic male test user
const createMaleTestUser = async () => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'ahmed.hassan@test.com' });
    if (existingUser) {
      console.log('✅ Male test user already exists');
      return existingUser;
    }

    const hashedPassword = await bcrypt.hash('ahmed123', 10);
    
    const testUser = new User({
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@test.com',
      password: hashedPassword,
      phone: '+92-321-9876543',
      role: 'user',
      foodPreferences: {
        preferredCuisines: ['Pakistani', 'Turkish', 'Arabic', 'Continental'],
        spiceLevelPreference: 'very_hot',
        dietaryRestrictions: ['halal'],
        allergies: [],
        favoriteCategories: ['Main Course', 'BBQ', 'Beverages', 'Appetizers'],
        avgRating: 4.3,
        totalInteractions: 52
      }
    });

    await testUser.save();
    console.log('✅ Created male test user: ahmed.hassan@test.com / ahmed123');
    return testUser;
  } catch (error) {
    console.error('❌ Error creating male test user:', error);
    return null;
  }
};

// Create realistic food orders for the last 30 days (male preferences)
const createMaleFoodOrders = async (user) => {
  try {
    const menus = await Menu.find().limit(25);
    if (menus.length === 0) {
      console.log('⚠️ No menu items found, skipping food orders');
      return [];
    }

    const orders = [];
    const orderDates = [
      { daysAgo: 1, items: 4, total: 2850, note: 'Late night order' },
      { daysAgo: 3, items: 2, total: 1450, note: 'Lunch order' },
      { daysAgo: 6, items: 5, total: 3200, note: 'Weekend family order' },
      { daysAgo: 9, items: 3, total: 2100, note: 'Dinner with friends' },
      { daysAgo: 12, items: 2, total: 1350, note: 'Quick lunch' },
      { daysAgo: 15, items: 6, total: 4500, note: 'Office party order' },
      { daysAgo: 18, items: 3, total: 2250, note: 'Weekend dinner' },
      { daysAgo: 21, items: 4, total: 2900, note: 'Family gathering' },
      { daysAgo: 24, items: 2, total: 1600, note: 'Business lunch' },
      { daysAgo: 27, items: 3, total: 2400, note: 'Evening snacks' },
      { daysAgo: 29, items: 5, total: 3800, note: 'Monthly team dinner' }
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
          customizations: i === 0 ? 'Extra spicy, no onions' : '',
          addOns: []
        });
        
        calculatedTotal += itemTotal;
      }

      const deliveryFee = 75;
      const finalTotal = orderData.total;

      const order = new Order({
        user: user._id,
        items: orderItems,
        totalPrice: finalTotal,
        deliveryFee: deliveryFee,
        deliveryAddress: 'Flat 205, Block B, Clifton Heights, Karachi',
        deliveryLocation: {
          type: "Point",
          coordinates: [67.0299, 24.8138]
        },
        status: ['delivered', 'delivered', 'delivered', 'confirmed', 'delivered'][Math.floor(Math.random() * 5)],
        specialInstructions: orderData.note,
        createdAt: orderDate,
        updatedAt: orderDate
      });

      await order.save();
      orders.push(order);
    }

    console.log(`✅ Created ${orders.length} food orders for male user`);
    return orders;
  } catch (error) {
    console.error('❌ Error creating male food orders:', error);
    return [];
  }
};

// Create realistic room bookings (business traveler profile)
const createMaleRoomBookings = async (user) => {
  try {
    const rooms = await Room.find().limit(10);
    if (rooms.length === 0) {
      console.log('⚠️ No rooms found, skipping room bookings');
      return [];
    }

    const bookings = [];
    const bookingDates = [
      { daysAgo: 2, nights: 3, total: 25500, purpose: 'Business trip' },
      { daysAgo: 10, nights: 2, total: 18000, purpose: 'Weekend getaway' },
      { daysAgo: 20, nights: 1, total: 9500, purpose: 'Meeting overnight' },
      { daysAgo: 28, nights: 4, total: 35000, purpose: 'Family vacation' }
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
        specialRequests: bookingData.purpose,
        createdAt: checkInDate,
        updatedAt: checkInDate
      });

      await booking.save();
      bookings.push(booking);
    }

    console.log(`✅ Created ${bookings.length} room bookings for male user`);
    return bookings;
  } catch (error) {
    console.error('❌ Error creating male room bookings:', error);
    return [];
  }
};

// Create realistic table reservations (social dining profile)
const createMaleTableReservations = async (user) => {
  try {
    const tables = await Table.find().limit(10);
    if (tables.length === 0) {
      console.log('⚠️ No tables found, skipping table reservations');
      return [];
    }

    const reservations = [];
    const reservationDates = [
      { daysAgo: 1, guests: 6, total: 4200, occasion: 'Business dinner' },
      { daysAgo: 4, guests: 2, total: 2100, occasion: 'Date night' },
      { daysAgo: 8, guests: 8, total: 6500, occasion: 'Birthday celebration' },
      { daysAgo: 13, guests: 4, total: 3200, occasion: 'Family dinner' },
      { daysAgo: 17, guests: 3, total: 2400, occasion: 'Friends meetup' },
      { daysAgo: 22, guests: 10, total: 8500, occasion: 'Office celebration' },
      { daysAgo: 25, guests: 5, total: 4100, occasion: 'Weekend gathering' },
      { daysAgo: 28, guests: 4, total: 3300, occasion: 'Client meeting' }
    ];

    for (const resData of reservationDates) {
      const table = tables[Math.floor(Math.random() * tables.length)];
      const reservationDate = new Date(Date.now() - (resData.daysAgo * 24 * 60 * 60 * 1000));

      const reservation = new Reservation({
        tableId: table._id,
        tableNumber: table.tableName,
        reservationDate: reservationDate.toISOString().split('T')[0],
        time: ['18:30', '19:00', '19:30', '20:00', '20:30'][Math.floor(Math.random() * 5)],
        endTime: ['21:00', '21:30', '22:00', '22:30', '23:00'][Math.floor(Math.random() * 5)],
        guests: resData.guests,
        payment: 'card',
        totalPrice: resData.total,
        userId: user._id,
        fullName: user.name,
        email: user.email,
        phone: user.phone,
        paymentStatus: 'succeeded',
        specialRequests: resData.occasion,
        createdAt: reservationDate,
        updatedAt: reservationDate
      });

      await reservation.save();
      reservations.push(reservation);
    }

    console.log(`✅ Created ${reservations.length} table reservations for male user`);
    return reservations;
  } catch (error) {
    console.error('❌ Error creating male table reservations:', error);
    return [];
  }
};

// Create room interactions (business traveler profile)
const createMaleRoomInteractions = async (user) => {
  try {
    const rooms = await Room.find().limit(15);
    if (rooms.length === 0) {
      console.log('⚠️ No rooms found, skipping room interactions');
      return [];
    }

    const interactions = [];
    // Weighted interaction types - more views and ratings, fewer bookings
    const interactionTypes = ['view', 'view', 'view', 'rating', 'rating', 'favorite', 'inquiry'];

    // Create 25 room interactions over the last 30 days
    for (let i = 0; i < 25; i++) {
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const interactionType = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const interactionDate = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));

      const interactionData = {
        userId: user._id,
        roomId: room._id,
        interactionType: interactionType,
        timestamp: interactionDate,
        groupSize: Math.floor(Math.random() * 4) + 1, // 1-4 people
        deviceType: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Add rating for rating interactions
      if (interactionType === 'rating') {
        interactionData.rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
      }

      // Add booking details for booking interactions
      if (interactionType === 'booking') {
        const checkInDate = new Date(interactionDate);
        const bookingDuration = Math.floor(Math.random() * 5) + 1; // 1-5 days
        const checkOutDate = new Date(checkInDate.getTime() + (bookingDuration * 24 * 60 * 60 * 1000));

        interactionData.checkInDate = checkInDate;
        interactionData.checkOutDate = checkOutDate;
        interactionData.bookingDuration = bookingDuration;
      }

      const interaction = new UserRoomInteraction(interactionData);
      await interaction.save();
      interactions.push(interaction);
    }

    console.log(`✅ Created ${interactions.length} room interactions for male user`);
    return interactions;
  } catch (error) {
    console.error('❌ Error creating male room interactions:', error);
    return [];
  }
};

// Create food interactions (male preferences - spicy food, BBQ, etc.)
const createMaleFoodInteractions = async (user) => {
  try {
    const menus = await Menu.find().limit(20);
    if (menus.length === 0) {
      console.log('⚠️ No menu items found, skipping food interactions');
      return [];
    }

    const interactions = [];
    const interactionTypes = ['rating', 'view', 'favorite', 'order'];

    for (let i = 0; i < 35; i++) {
      const menu = menus[Math.floor(Math.random() * menus.length)];
      const interactionType = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const interactionDate = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));

      const interaction = new UserFoodInteraction({
        userId: user._id,
        menuItemId: menu._id,
        interactionType: interactionType,
        rating: interactionType === 'rating' ? Math.floor(Math.random() * 2) + 4 : undefined, // 4-5 stars
        orderQuantity: interactionType === 'order' ? Math.floor(Math.random() * 4) + 1 : 1,
        timestamp: interactionDate,
        expiresAt: new Date(interactionDate.getTime() + (30 * 24 * 60 * 60 * 1000))
      });

      await interaction.save();
      interactions.push(interaction);
    }

    console.log(`✅ Created ${interactions.length} food interactions for male user`);
    return interactions;
  } catch (error) {
    console.error('❌ Error creating male food interactions:', error);
    return [];
  }
};

// Main function
const main = async () => {
  await connectDB();
  
  console.log('🚀 Creating realistic MALE test user with 1-month history...\n');
  
  const user = await createMaleTestUser();
  if (!user) {
    console.log('❌ Failed to create male user, exiting...');
    process.exit(1);
  }

  await createMaleFoodOrders(user);
  await createMaleRoomBookings(user);
  await createMaleRoomInteractions(user);
  await createMaleTableReservations(user);
  await createMaleFoodInteractions(user);

  console.log('\n✅ Successfully created realistic MALE test user with comprehensive 1-month history!');
  console.log('\n📋 MALE USER LOGIN CREDENTIALS:');
  console.log('Email: ahmed.hassan@test.com');
  console.log('Password: ahmed123');
  console.log('\n👨 MALE USER PROFILE:');
  console.log('- Name: Ahmed Hassan');
  console.log('- Phone: +92-321-9876543');
  console.log('- Preferences: Pakistani, Turkish, Arabic, Continental cuisine');
  console.log('- Spice Level: High');
  console.log('- Profile: Business professional with social dining habits');
  console.log('\n🎯 This MALE user has:');
  console.log('- 11 food orders in the last 30 days (Rs. 28,450)');
  console.log('- 4 room bookings in the last 30 days (Rs. 88,000)');
  console.log('- 25 room interactions (views, ratings, favorites)');
  console.log('- 8 table reservations in the last 30 days (Rs. 34,300)');
  console.log('- 35+ food interactions (ratings, views, favorites)');
  console.log('- Total spending: Rs. 150,750+ across all modules');
  console.log('- Profile type: Business professional & social diner');
  
  mongoose.connection.close();
};

main().catch(console.error);
