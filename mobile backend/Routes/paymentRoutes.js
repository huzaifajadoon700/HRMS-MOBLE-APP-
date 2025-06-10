const express = require("express");
const router = express.Router();
const paymentController = require("../Controllers/paymentController");
const { ensureAuthenticated } = require("../Middlewares/Auth");

// Menu order payment
router.post(
  "/menu-payment",
  ensureAuthenticated,
  paymentController.createMenuPaymentIntent
);

// Room booking payment
router.post(
  "/room-payment",
  ensureAuthenticated,
  paymentController.createRoomPaymentIntent
);

// Table reservation payment
router.post(
  "/table-payment",
  ensureAuthenticated,
  paymentController.createTablePaymentIntent
);

// Stripe webhook
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook
);

// General payment routes (temporarily remove authentication for testing)
router.post("/create-payment-intent", paymentController.createPaymentIntent);
// Temporarily remove authentication for payment confirmation (for testing)
router.post("/confirm-payment", paymentController.confirmPayment);

// Test route without authentication for debugging
router.post("/test-confirm-payment", paymentController.confirmPayment);

module.exports = router;
