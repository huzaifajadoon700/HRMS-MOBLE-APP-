const express = require('express');
const router = express.Router();
const paymentController = require('../Controllers/paymentController');
const { ensureAuthenticated } = require('../Middlewares/Auth');

// Middleware to log all payment requests for debugging
router.use((req, res, next) => {
  console.log(`🔄 Payment API Request: ${req.method} ${req.path}`);
  console.log(`📱 Request Body:`, req.body);
  console.log(`🔐 Auth Header:`, req.headers.authorization ? 'Present' : 'Missing');
  next();
});

// Menu order payment
router.post('/menu-payment', ensureAuthenticated, paymentController.createMenuPaymentIntent);

// Room booking payment
router.post('/room-payment', ensureAuthenticated, paymentController.createRoomPaymentIntent);

// Table reservation payment
router.post('/table-payment', ensureAuthenticated, paymentController.createTablePaymentIntent);

// Stripe webhook (no auth needed for webhooks)
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.handleWebhook);

// General payment routes for mobile app
router.post('/create-payment-intent', ensureAuthenticated, paymentController.createPaymentIntent);
router.post('/confirm-payment', ensureAuthenticated, paymentController.confirmPayment);

// Test routes without authentication (for debugging only - remove in production)
router.post('/test-create-payment-intent', paymentController.createPaymentIntent);
router.post('/test-confirm-payment', paymentController.confirmPayment);

module.exports = router;