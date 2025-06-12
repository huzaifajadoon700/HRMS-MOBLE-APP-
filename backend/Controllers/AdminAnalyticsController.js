const Order = require('../Models/Order');
const Booking = require('../Models/Booking');
const Reservation = require('../Models/Reservations'); // File is Reservations.js but exports Reservation
const Room = require('../Models/Room');
const Table = require('../Models/Table');
const Menu = require('../Models/Menu');
const User = require('../Models/User');
const Feedback = require('../Models/Feedback');

// Get comprehensive dashboard analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const thisYear = new Date(today.getFullYear(), 0, 1);

    // Parallel data fetching for better performance
    const [
      // Counts
      totalRooms,
      totalTables,
      totalMenuItems,
      totalUsers,
      totalOrders,
      totalBookings,
      totalReservations,

      // Orders data
      ordersData,
      ordersThisMonth,
      ordersLastMonth,

      // Bookings data
      bookingsData,
      bookingsThisMonth,
      bookingsLastMonth,

      // Reservations data
      reservationsData,
      reservationsThisMonth,
      reservationsLastMonth,
      
      // Room status
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      
      // Today's data
      todayOrders,
      todayBookings,
      todayReservations,
      
      // Feedback data
      totalFeedbacks,
      positiveFeedbacks,
      negativeFeedbacks
    ] = await Promise.all([
      // Basic counts
      Room.countDocuments(),
      Table.countDocuments(),
      Menu.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      Booking.countDocuments(),
      Reservation.countDocuments(),
      
      // Orders with revenue AND items for trending analysis
      Order.find().select('totalPrice status createdAt items'),
      Order.find({ createdAt: { $gte: thisMonth } }).select('totalPrice status createdAt items'),
      Order.find({
        createdAt: { $gte: lastMonth, $lt: thisMonth }
      }).select('totalPrice status createdAt items'),
      
      // Bookings with revenue - using correct field names from Booking model
      Booking.find().select('totalPrice status createdAt checkInDate checkOutDate roomType roomNumber roomId userId fullName email phone'),
      Booking.find({
        $or: [
          { createdAt: { $gte: thisMonth } },
          { checkInDate: { $gte: thisMonth } }
        ]
      }).select('totalPrice status createdAt checkInDate checkOutDate roomType roomNumber roomId userId fullName email phone'),
      Booking.find({
        $or: [
          { createdAt: { $gte: lastMonth, $lt: thisMonth } },
          { checkInDate: { $gte: lastMonth, $lt: thisMonth } }
        ]
      }).select('totalPrice status createdAt checkInDate checkOutDate roomType roomNumber roomId userId fullName email phone'),
      
      // Reservations with revenue
      Reservation.find().select('totalPrice amount price status createdAt reservationDate'),
      Reservation.find({
        $or: [
          { createdAt: { $gte: thisMonth } },
          { reservationDate: { $gte: thisMonth } }
        ]
      }).select('totalPrice amount price status createdAt reservationDate'),
      Reservation.find({
        $or: [
          { createdAt: { $gte: lastMonth, $lt: thisMonth } },
          { reservationDate: { $gte: lastMonth, $lt: thisMonth } }
        ]
      }).select('totalPrice amount price status createdAt reservationDate'),
      
      // Room status
      Room.countDocuments({ status: { $in: ['available', 'Available'] } }),
      Room.countDocuments({ status: { $in: ['occupied', 'Occupied'] } }),
      Room.countDocuments({ status: { $in: ['maintenance', 'Maintenance'] } }),
      
      // Today's activity
      Order.countDocuments({ 
        createdAt: { 
          $gte: new Date(today.setHours(0, 0, 0, 0)),
          $lt: new Date(today.setHours(23, 59, 59, 999))
        }
      }),
      Booking.countDocuments({ 
        $or: [
          { createdAt: { 
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999))
          }},
          { checkInDate: { 
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999))
          }}
        ]
      }),
      Reservation.countDocuments({
        $or: [
          { createdAt: {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999))
          }},
          { reservationDate: {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999))
          }}
        ]
      }),
      
      // Feedback counts
      Feedback.countDocuments(),
      Feedback.countDocuments({ rating: { $gte: 4 } }),
      Feedback.countDocuments({ rating: { $lt: 3 } })
    ]);

    // Calculate revenue with detailed logging
    console.log('📊 Calculating revenue...');
    console.log('📦 Orders data count:', ordersData.length);
    console.log('🏨 Bookings data count:', bookingsData.length);
    console.log('🪑 Reservations data count:', reservationsData.length);

    const foodRevenue = ordersData.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const foodRevenueThisMonth = ordersThisMonth.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const foodRevenueLastMonth = ordersLastMonth.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    console.log('🍽️ Food Revenue:', { total: foodRevenue, thisMonth: foodRevenueThisMonth, lastMonth: foodRevenueLastMonth });

    const roomRevenue = bookingsData.reduce((sum, booking) => {
      // Calculate nights between check-in and check-out
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));

      // Use totalPrice from booking model
      const price = booking.totalPrice || 0;
      console.log(`🏨 Booking ${booking._id}: Room ${booking.roomNumber} (${booking.roomType}) - Rs.${price} for ${nights} nights`);
      return sum + price;
    }, 0);

    const roomRevenueThisMonth = bookingsThisMonth.reduce((sum, booking) => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
      const price = booking.totalPrice || 0;
      console.log(`🏨 This Month Booking ${booking._id}: Rs.${price}`);
      return sum + price;
    }, 0);

    const roomRevenueLastMonth = bookingsLastMonth.reduce((sum, booking) => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
      const price = booking.totalPrice || 0;
      console.log(`🏨 Last Month Booking ${booking._id}: Rs.${price}`);
      return sum + price;
    }, 0);

    console.log('🏨 Total Room Revenue:', roomRevenue);
    console.log('🏨 Room Revenue This Month:', roomRevenueThisMonth);
    console.log('🏨 Room Revenue Last Month:', roomRevenueLastMonth);

    const tableRevenue = reservationsData.reduce((sum, reservation) => {
      return sum + (reservation.totalPrice || reservation.amount || reservation.price || 0);
    }, 0);
    const tableRevenueThisMonth = reservationsThisMonth.reduce((sum, reservation) => {
      return sum + (reservation.totalPrice || reservation.amount || reservation.price || 0);
    }, 0);
    const tableRevenueLastMonth = reservationsLastMonth.reduce((sum, reservation) => {
      return sum + (reservation.totalPrice || reservation.amount || reservation.price || 0);
    }, 0);

    const totalRevenue = foodRevenue + roomRevenue + tableRevenue;
    const totalRevenueThisMonth = foodRevenueThisMonth + roomRevenueThisMonth + tableRevenueThisMonth;
    const totalRevenueLastMonth = foodRevenueLastMonth + roomRevenueLastMonth + tableRevenueLastMonth;

    // Calculate growth
    const revenueGrowth = totalRevenueLastMonth > 0 
      ? (((totalRevenueThisMonth - totalRevenueLastMonth) / totalRevenueLastMonth) * 100).toFixed(1)
      : totalRevenueThisMonth > 0 ? 100 : 0;

    // Calculate success rates
    const deliveredOrders = ordersData.filter(order => order.status === 'delivered' || order.status === 'Delivered').length;
    const pendingOrders = ordersData.filter(order => order.status === 'pending' || order.status === 'Pending').length;
    const cancelledOrders = ordersData.filter(order => order.status === 'cancelled' || order.status === 'Cancelled').length;

    const activeBookings = bookingsData.filter(booking => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const now = new Date();
      return checkIn <= now && checkOut >= now;
    }).length;

    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0;
    const successRate = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      analytics: {
        overview: {
          totalRevenue,
          totalRevenueThisMonth,
          revenueGrowth: parseFloat(revenueGrowth),
          isGrowthPositive: parseFloat(revenueGrowth) >= 0,
          totalItems: totalMenuItems + totalRooms + totalTables,
          totalUsers,
          totalTransactions: totalOrders + totalBookings + totalReservations
        },
        revenue: {
          total: totalRevenue,
          thisMonth: totalRevenueThisMonth,
          lastMonth: totalRevenueLastMonth,
          food: foodRevenue,
          rooms: roomRevenue,
          tables: tableRevenue,
          breakdown: {
            foodPercentage: totalRevenue > 0 ? ((foodRevenue / totalRevenue) * 100).toFixed(1) : 0,
            roomsPercentage: totalRevenue > 0 ? ((roomRevenue / totalRevenue) * 100).toFixed(1) : 0,
            tablesPercentage: totalRevenue > 0 ? ((tableRevenue / totalRevenue) * 100).toFixed(1) : 0
          }
        },
        rooms: {
          total: totalRooms,
          available: availableRooms,
          occupied: occupiedRooms,
          maintenance: maintenanceRooms,
          occupancyRate: parseFloat(occupancyRate),
          revenue: roomRevenue,
          bookings: totalBookings,
          activeBookings
        },
        food: {
          totalMenuItems,
          totalOrders,
          delivered: deliveredOrders,
          pending: pendingOrders,
          cancelled: cancelledOrders,
          successRate: parseFloat(successRate),
          revenue: foodRevenue,
          avgOrderValue: totalOrders > 0 ? (foodRevenue / totalOrders).toFixed(0) : 0
        },
        tables: {
          total: totalTables,
          reservations: totalReservations,
          todayReservations,
          revenue: tableRevenue,
          avgReservationValue: totalReservations > 0 ? (tableRevenue / totalReservations).toFixed(0) : 0
        },
        activity: {
          today: {
            orders: todayOrders,
            bookings: todayBookings,
            reservations: todayReservations,
            total: todayOrders + todayBookings + todayReservations
          },
          thisMonth: {
            orders: ordersThisMonth.length,
            bookings: bookingsThisMonth.length,
            reservations: reservationsThisMonth.length
          }
        },
        feedback: {
          total: totalFeedbacks,
          positive: positiveFeedbacks,
          negative: negativeFeedbacks,
          satisfaction: totalFeedbacks > 0 ? ((positiveFeedbacks / totalFeedbacks) * 100).toFixed(1) : 0
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard analytics',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardAnalytics
};
