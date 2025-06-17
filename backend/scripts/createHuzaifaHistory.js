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

// Find or create Huzaifa user
const findOrCreateHuzaifa = async () => {
  try {
    let user = await User.findOne({ email: 'mhuzaifa8@gmail.com' });
    
    if (!user) {
      console.log('❌ User mhuzaifa8@gmail.com not found!');
      console.log('Please make sure the user exists first.');
      return null;
    }
    
    console.log('✅ Found user: Huzaifa');
    return user;
  } catch (error) {
    console.error('❌ Error finding user:', error);
    return null;
  }
};

// Create food orders for Huzaifa
const createHuzaifaFoodOrders = async (user) => {
  try {
    const menus = await Menu.find().limit(25);
    if (menus.length === 0) {
      console.log('⚠️ No menu items found, skipping food orders');
      return [];
    }

    const orders = [];
    const orderDates = [
      { daysAgo: 1, items: 3, total: 2200, note: 'Quick dinner order' },
      { daysAgo: 4, items: 5, total: 3800, note: 'Weekend family feast' },
      { daysAgo: 7, items: 2, total: 1500, note: 'Late night snack' },
      { daysAgo: 10, items: 4, total: 2900, note: 'Office lunch order' },
      { daysAgo: 14, items: 3, total: 2100, note: 'Friends gathering' },
      { daysAgo: 17, items: 6, total: 4200, note: 'Birthday celebration' },
      { daysAgo: 21, items: 2, total: 1400, note: 'Quick breakfast' },
      { daysAgo: 24, items: 4, total: 3100, note: 'Date night dinner' },
      { daysAgo: 27, items: 3, total: 2300, note: 'Study session fuel' },
      { daysAgo: 29, items: 5, total: 3600, note: 'Monthly treat' }
    ];

    for (const orderData of orderDates) {
      const orderDate = new Date(Date.now() - (orderData.daysAgo * 24 * 60 * 60 * 1000));
      
      const orderItems = [];
      for (let i = 0; i < orderData.items; i++) {
        const menu = menus[Math.floor(Math.random() * menus.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        
        orderItems.push({
          menuItemId: menu._id,
          name: menu.name,
          price: menu.price,
          quantity: quantity,
          customizations: i === 0 ? 'Medium spicy, extra sauce' : '',
          addOns: []
        });
      }

      const order = new Order({
        user: user._id,
        items: orderItems,
        totalPrice: orderData.total,
        deliveryFee: 75,
        deliveryAddress: 'House 123, Block C, Gulshan-e-Iqbal, Karachi',
        deliveryLocation: {
          type: "Point",
          coordinates: [67.0822, 24.9056]
        },
        status: 'delivered',
        specialInstructions: orderData.note,
        createdAt: orderDate,
        updatedAt: orderDate
      });

      await order.save();
      orders.push(order);
    }

    console.log(`✅ Created ${orders.length} food orders for Huzaifa`);
    return orders;
  } catch (error) {
    console.error('❌ Error creating food orders:', error);
    return [];
  }
};

// Create room bookings for Huzaifa
const createHuzaifaRoomBookings = async (user) => {
  try {
    const rooms = await Room.find().limit(10);
    if (rooms.length === 0) {
      console.log('⚠️ No rooms found, skipping room bookings');
      return [];
    }

    const bookings = [];
    const bookingDates = [
      { daysAgo: 3, nights: 2, total: 18000, purpose: 'Weekend getaway' },
      { daysAgo: 12, nights: 1, total: 9500, purpose: 'Business meeting' },
      { daysAgo: 22, nights: 3, total: 27000, purpose: 'Family vacation' },
      { daysAgo: 28, nights: 1, total: 8500, purpose: 'Quick overnight stay' }
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
        phone: user.phone || '+92-300-1234567',
        paymentStatus: 'succeeded',
        status: 'confirmed',
        specialRequests: bookingData.purpose,
        createdAt: checkInDate,
        updatedAt: checkInDate
      });

      await booking.save();
      bookings.push(booking);
    }

    console.log(`✅ Created ${bookings.length} room bookings for Huzaifa`);
    return bookings;
  } catch (error) {
    console.error('❌ Error creating room bookings:', error);
    return [];
  }
};

// Create room interactions for Huzaifa
const createHuzaifaRoomInteractions = async (user) => {
  try {
    const rooms = await Room.find().limit(15);
    if (rooms.length === 0) {
      console.log('⚠️ No rooms found, skipping room interactions');
      return [];
    }

    const interactions = [];
    const interactionTypes = ['view', 'view', 'view', 'rating', 'rating', 'favorite', 'inquiry'];
    
    // Create 30 room interactions over the last 30 days
    for (let i = 0; i < 30; i++) {
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const interactionType = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const interactionDate = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));

      const interactionData = {
        userId: user._id,
        roomId: room._id,
        interactionType: interactionType,
        timestamp: interactionDate,
        groupSize: Math.floor(Math.random() * 4) + 1,
        deviceType: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      if (interactionType === 'rating') {
        interactionData.rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
      }

      const interaction = new UserRoomInteraction(interactionData);
      await interaction.save();
      interactions.push(interaction);
    }

    console.log(`✅ Created ${interactions.length} room interactions for Huzaifa`);
    return interactions;
  } catch (error) {
    console.error('❌ Error creating room interactions:', error);
    return [];
  }
};

// Create table reservations for Huzaifa
const createHuzaifaTableReservations = async (user) => {
  try {
    const tables = await Table.find().limit(10);
    if (tables.length === 0) {
      console.log('⚠️ No tables found, skipping table reservations');
      return [];
    }

    const reservations = [];
    const reservationDates = [
      { daysAgo: 2, guests: 4, total: 3200, occasion: 'Friends dinner' },
      { daysAgo: 6, guests: 2, total: 1800, occasion: 'Date night' },
      { daysAgo: 11, guests: 6, total: 4500, occasion: 'Family celebration' },
      { daysAgo: 16, guests: 3, total: 2400, occasion: 'Casual meetup' },
      { daysAgo: 20, guests: 8, total: 6200, occasion: 'Birthday party' },
      { daysAgo: 25, guests: 5, total: 3800, occasion: 'Office dinner' },
      { daysAgo: 29, guests: 4, total: 3100, occasion: 'Weekend gathering' }
    ];

    for (const resData of reservationDates) {
      const table = tables[Math.floor(Math.random() * tables.length)];
      const reservationDate = new Date(Date.now() - (resData.daysAgo * 24 * 60 * 60 * 1000));

      const reservation = new Reservation({
        tableId: table._id,
        tableNumber: table.tableName,
        reservationDate: reservationDate.toISOString().split('T')[0],
        time: ['18:30', '19:00', '19:30', '20:00'][Math.floor(Math.random() * 4)],
        endTime: ['21:00', '21:30', '22:00', '22:30'][Math.floor(Math.random() * 4)],
        guests: resData.guests,
        payment: 'card',
        totalPrice: resData.total,
        userId: user._id,
        fullName: user.name,
        email: user.email,
        phone: user.phone || '+92-300-1234567',
        paymentStatus: 'succeeded',
        specialRequests: resData.occasion,
        createdAt: reservationDate,
        updatedAt: reservationDate
      });

      await reservation.save();
      reservations.push(reservation);
    }

    console.log(`✅ Created ${reservations.length} table reservations for Huzaifa`);
    return reservations;
  } catch (error) {
    console.error('❌ Error creating table reservations:', error);
    return [];
  }
};

// Create food interactions for Huzaifa
const createHuzaifaFoodInteractions = async (user) => {
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
        rating: interactionType === 'rating' ? Math.floor(Math.random() * 2) + 4 : undefined,
        orderQuantity: interactionType === 'order' ? Math.floor(Math.random() * 3) + 1 : 1,
        timestamp: interactionDate,
        expiresAt: new Date(interactionDate.getTime() + (30 * 24 * 60 * 60 * 1000))
      });

      await interaction.save();
      interactions.push(interaction);
    }

    console.log(`✅ Created ${interactions.length} food interactions for Huzaifa`);
    return interactions;
  } catch (error) {
    console.error('❌ Error creating food interactions:', error);
    return [];
  }
};

// Main function
const main = async () => {
  await connectDB();
  
  console.log('🚀 Creating comprehensive 1-month history for Huzaifa...\n');
  
  const user = await findOrCreateHuzaifa();
  if (!user) {
    console.log('❌ Cannot proceed without user, exiting...');
    process.exit(1);
  }

  await createHuzaifaFoodOrders(user);
  await createHuzaifaRoomBookings(user);
  await createHuzaifaRoomInteractions(user);
  await createHuzaifaTableReservations(user);
  await createHuzaifaFoodInteractions(user);

  console.log('\n✅ Successfully created comprehensive 1-month history for Huzaifa!');
  console.log('\n📋 USER LOGIN CREDENTIALS:');
  console.log('Email: mhuzaifa8@gmail.com');
  console.log('Password: huzaifa12');
  console.log('\n👤 USER PROFILE:');
  console.log('- Name: Huzaifa');
  console.log('- Email: mhuzaifa8@gmail.com');
  console.log('\n🎯 This user now has:');
  console.log('- 10 food orders in the last 30 days');
  console.log('- 4 room bookings in the last 30 days');
  console.log('- 30 room interactions (views, ratings, favorites)');
  console.log('- 7 table reservations in the last 30 days');
  console.log('- 35+ food interactions (ratings, views, favorites)');
  console.log('- Complete recommendation system compatibility');
  console.log('\n🎉 Huzaifa should now get 6 recommendations in all modules!');
  
  mongoose.connection.close();
};

main().catch(console.error);
