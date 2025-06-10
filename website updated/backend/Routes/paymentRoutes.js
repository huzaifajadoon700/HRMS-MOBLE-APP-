const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { ensureAuthenticated } = require('../Middlewares/Auth');

// Menu order payment
router.post('/menu-payment', ensureAuthenticated, paymentController.createMenuPaymentIntent);

// Room booking payment
router.post('/room-payment', ensureAuthenticated, paymentController.createRoomPaymentIntent);

// Table reservation payment
router.post('/table-payment', ensureAuthenticated, paymentController.createTablePaymentIntent);

// Stripe webhook
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.handleWebhook);

// General payment routes
router.post('/create-payment-intent', ensureAuthenticated, paymentController.createPaymentIntent);
router.post('/confirm-payment', ensureAuthenticated, paymentController.confirmPayment);

module.exports = router; 