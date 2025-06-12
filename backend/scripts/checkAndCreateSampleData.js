const mongoose = require('mongoose');
const Order = require('../Models/Order');
const Booking = require('../Models/Booking');
const Reservation = require('../Models/Reservations');
const Menu = require('../Models/Menu');
const Room = require('../Models/Room');
const Table = require('../Models/Table');
const User = require('../Models/User');

async function checkDatabaseState() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hrms');
    console.log('🔗 Connected to MongoDB');

    console.log('\n=== CURRENT DATABASE STATE ===');
    
    // Check all collections
    const counts = {
      users: await User.countDocuments(),
      orders: await Order.countDocuments(),
      bookings: await Booking.countDocuments(),
      reservations: await Reservation.countDocuments(),
      menus: await Menu.countDocuments(),
      rooms: await Room.countDocuments(),
      tables: await Table.countDocuments()
    };

    console.log('📊 Collection Counts:');
    Object.entries(counts).forEach(([key, count]) => {
      console.log(`   ${key.charAt(0).toUpperCase() + key.slice(1)}: ${count}`);
    });

    // Check sample data
    console.log('\n=== SAMPLE DATA CHECK ===');
    
    const sampleOrder = await Order.findOne().populate('user', 'name email');
    const sampleBooking = await Booking.findOne();
    const sampleReservation = await Reservation.findOne();
    const sampleMenu = await Menu.findOne();

    console.log('Sample Order:', sampleOrder ? {
      id: sampleOrder._id,
      user: sampleOrder.user?.name || 'Unknown',
      items: sampleOrder.items?.length || 0,
      total: sampleOrder.totalPrice,
      status: sampleOrder.status
    } : 'None');

    console.log('Sample Booking:', sampleBooking ? {
      id: sampleBooking._id,
      roomType: sampleBooking.roomType,
      total: sampleBooking.totalPrice,
      checkIn: sampleBooking.checkInDate
    } : 'None');

    console.log('Sample Menu:', sampleMenu ? {
      name: sampleMenu.name,
      price: sampleMenu.price,
      category: sampleMenu.category
    } : 'None');

    // Calculate revenue
    const orders = await Order.find().select('totalPrice status createdAt');
    const bookings = await Booking.find().select('totalPrice createdAt');
    const reservations = await Reservation.find().select('totalPrice amount price createdAt');

    const foodRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const roomRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    const tableRevenue = reservations.reduce((sum, res) => sum + (res.totalPrice || res.amount || res.price || 0), 0);

    console.log('\n💰 Revenue Breakdown:');
    console.log(`   Food Orders: Rs. ${foodRevenue}`);
    console.log(`   Room Bookings: Rs. ${roomRevenue}`);
    console.log(`   Table Reservations: Rs. ${tableRevenue}`);
    console.log(`   Total Revenue: Rs. ${foodRevenue + roomRevenue + tableRevenue}`);

    return {
      counts,
      hasData: counts.orders > 0 || counts.bookings > 0 || counts.reservations > 0,
      revenue: { food: foodRevenue, rooms: roomRevenue, tables: tableRevenue }
    };

  } catch (error) {
    console.error('❌ Error checking database:', error);
    return null;
  }
}

async function createSampleOrders() {
  try {
    console.log('\n🌱 Creating sample orders...');
    
    // Get sample users and menu items
    const users = await User.find().limit(5);
    const menuItems = await Menu.find().limit(10);
    
    if (users.length === 0) {
      console.log('❌ No users found. Please create users first.');
      return;
    }
    
    if (menuItems.length === 0) {
      console.log('❌ No menu items found. Please create menu items first.');
      return;
    }

    const sampleOrders = [];
    const statuses = ['delivered', 'pending', 'confirmed', 'preparing'];
    
    // Create 15 sample orders
    for (let i = 0; i < 15; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
      const orderItems = [];
      let totalPrice = 0;
      
      for (let j = 0; j < numItems; j++) {
        const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
        const itemTotal = menuItem.price * quantity;
        
        orderItems.push({
          menuItemId: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: quantity,
          customizations: ''
        });
        
        totalPrice += itemTotal;
      }
      
      const deliveryFee = 50; // Fixed delivery fee
      totalPrice += deliveryFee;
      
      // Create order with date in last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const orderDate = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));
      
      sampleOrders.push({
        user: user._id,
        items: orderItems,
        totalPrice: totalPrice,
        deliveryFee: deliveryFee,
        deliveryAddress: `Sample Address ${i + 1}, Karachi`,
        deliveryLocation: {
          type: "Point",
          coordinates: [67.0011, 24.8607] // Karachi coordinates
        },
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: orderDate,
        updatedAt: orderDate
      });
    }
    
    const insertedOrders = await Order.insertMany(sampleOrders);
    console.log(`✅ Created ${insertedOrders.length} sample orders`);
    
    return insertedOrders;
    
  } catch (error) {
    console.error('❌ Error creating sample orders:', error);
    return [];
  }
}

async function createSampleBookings() {
  try {
    console.log('\n🏨 Creating sample bookings...');
    
    const users = await User.find().limit(5);
    const rooms = await Room.find().limit(10);
    
    if (users.length === 0 || rooms.length === 0) {
      console.log('❌ Need users and rooms to create bookings');
      return;
    }

    const sampleBookings = [];
    
    // Create 10 sample bookings
    for (let i = 0; i < 10; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      
      const daysAgo = Math.floor(Math.random() * 30);
      const checkInDate = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));
      const checkOutDate = new Date(checkInDate.getTime() + (2 * 24 * 60 * 60 * 1000)); // 2 days stay
      
      const nights = 2;
      const totalPrice = room.price * nights;
      
      sampleBookings.push({
        roomId: room._id,
        roomType: room.roomType,
        roomNumber: room.roomNumber,
        checkInDate: checkInDate.toISOString().split('T')[0],
        checkOutDate: checkOutDate.toISOString().split('T')[0],
        guests: Math.floor(Math.random() * 4) + 1,
        payment: Math.random() > 0.5 ? 'card' : 'paypal',
        totalPrice: totalPrice,
        userId: user._id,
        fullName: user.name || `Guest ${i + 1}`,
        createdAt: checkInDate,
        updatedAt: checkInDate
      });
    }
    
    const insertedBookings = await Booking.insertMany(sampleBookings);
    console.log(`✅ Created ${insertedBookings.length} sample bookings`);
    
    return insertedBookings;
    
  } catch (error) {
    console.error('❌ Error creating sample bookings:', error);
    return [];
  }
}

async function main() {
  try {
    console.log('🔍 CHECKING DATABASE STATE AND CREATING SAMPLE DATA\n');
    
    const dbState = await checkDatabaseState();
    
    if (!dbState) {
      console.log('❌ Failed to check database state');
      return;
    }
    
    if (!dbState.hasData) {
      console.log('\n⚠️ No transaction data found. Creating sample data...');
      
      await createSampleOrders();
      await createSampleBookings();
      
      console.log('\n🔄 Rechecking database state...');
      await checkDatabaseState();
    } else {
      console.log('\n✅ Database has transaction data');
    }
    
    console.log('\n🎉 Database check and sample data creation completed!');
    
  } catch (error) {
    console.error('❌ Error in main process:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { checkDatabaseState, createSampleOrders, createSampleBookings };
