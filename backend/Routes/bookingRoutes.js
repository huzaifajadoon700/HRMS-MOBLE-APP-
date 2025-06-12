const express = require("express");
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require("../Middlewares/Auth");
const {
  createBooking,
  getAllBookings,
  getBookingsByUser,
  updateBooking,
  deleteBooking,
  getBookingById,
} = require("../Controllers/BookingController");

// Create a new booking (authenticated users only)
router.post("/", ensureAuthenticated, createBooking);

// Fetch all bookings for the logged-in user (authenticated users only)
router.get("/user", ensureAuthenticated, getBookingsByUser);

// Test endpoint to check booking data (admin only)
router.get("/test", [ensureAuthenticated, ensureAdmin], async (req, res) => {
  try {
    const Booking = require("../Models/Booking");
    console.log("🧪 Testing booking data...");

    // Get all bookings with detailed info
    const bookings = await Booking.find().select('totalPrice roomType roomNumber checkInDate checkOutDate createdAt userId');
    console.log("🧪 Found bookings:", bookings.length);

    // Calculate total revenue
    const totalRevenue = bookings.reduce((sum, booking) => {
      const price = booking.totalPrice || 0;
      console.log(`🧪 Booking ${booking._id}: Rs.${price} (${booking.roomType})`);
      return sum + price;
    }, 0);

    console.log("🧪 Total Revenue:", totalRevenue);

    // Check for your specific booking amount
    const highValueBookings = bookings.filter(b => b.totalPrice >= 20000);
    console.log("🧪 High value bookings (>=20k):", highValueBookings.length);

    res.json({
      success: true,
      count: bookings.length,
      totalRevenue,
      highValueBookings: highValueBookings.length,
      bookings: bookings.slice(0, 10), // Show first 10 bookings
      message: "Booking data test successful",
      sampleBooking: bookings.length > 0 ? {
        id: bookings[0]._id,
        totalPrice: bookings[0].totalPrice,
        roomType: bookings[0].roomType,
        checkIn: bookings[0].checkInDate
      } : null
    });
  } catch (error) {
    console.error("🧪 Test error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Direct database check (admin only)
router.get("/db-check", [ensureAuthenticated, ensureAdmin], async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;

    // Get raw booking data from database
    const rawBookings = await db.collection('bookings').find({}).toArray();
    console.log("🔍 Raw bookings from DB:", rawBookings.length);

    if (rawBookings.length > 0) {
      console.log("🔍 Sample raw booking:", rawBookings[0]);

      // Calculate revenue from raw data
      const rawRevenue = rawBookings.reduce((sum, booking) => {
        const price = booking.totalPrice || 0;
        console.log(`🔍 Raw booking ${booking._id}: Rs.${price}`);
        return sum + price;
      }, 0);

      console.log("🔍 Raw revenue total:", rawRevenue);
    }

    res.json({
      success: true,
      rawCount: rawBookings.length,
      rawBookings: rawBookings.slice(0, 5),
      message: "Direct database check completed"
    });
  } catch (error) {
    console.error("🔍 DB check error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch all bookings (admin only)
router.get("/", [ensureAuthenticated, ensureAdmin], getAllBookings);

// Get a booking by ID - this must come after /user to avoid conflict
router.get("/:id", ensureAuthenticated, getBookingById);

// Update a booking (authenticated users only)
router.put("/:id", ensureAuthenticated, updateBooking);

// Delete a booking - allow users to cancel their own bookings
router.delete("/:id", ensureAuthenticated, deleteBooking);

module.exports = router;