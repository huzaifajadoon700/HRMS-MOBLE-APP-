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

// Fetch all bookings (admin only)
router.get("/", [ensureAuthenticated, ensureAdmin], getAllBookings);

// Get a booking by ID - this must come after /user to avoid conflict
router.get("/:id", ensureAuthenticated, getBookingById);

// Update a booking (authenticated users only)
router.put("/:id", ensureAuthenticated, updateBooking);

// Delete a booking - allow users to cancel their own bookings
router.delete("/:id", ensureAuthenticated, deleteBooking);

module.exports = router;