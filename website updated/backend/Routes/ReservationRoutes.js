const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../Middlewares/Auth");
const {
  createReservation,
  getAllReservations,
  getReservationsByUser,
  updateReservation,
  deleteReservation,
  getReservationById,
  generateInvoice,
  downloadInvoice,
  getReservationUserDetails
} = require("../Controllers/ReservationController");

// Create a new reservation (authenticated users only)
router.post("/", ensureAuthenticated, createReservation);

// Fetch all reservations for the logged-in user (authenticated users only)
router.get("/user", ensureAuthenticated, getReservationsByUser);

// Fetch all reservations (admin only)
router.get("/", ensureAuthenticated, getAllReservations);

// Get a reservation by ID - this must come after /user to avoid conflict
router.get("/:id", ensureAuthenticated, getReservationById);

// Get user details for a reservation
router.get("/:id/user-details", ensureAuthenticated, getReservationUserDetails);

// Update a reservation (authenticated users only)
router.put("/:id", ensureAuthenticated, updateReservation);

// Delete a reservation (authenticated users only)
router.delete("/:id", ensureAuthenticated, deleteReservation);

// Generate invoice for a reservation
router.post("/:id/generate-invoice", ensureAuthenticated, generateInvoice);

// Download invoice for a reservation
router.get("/:id/invoice", ensureAuthenticated, downloadInvoice);

module.exports = router;