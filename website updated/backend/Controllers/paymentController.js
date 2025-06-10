const stripe = require('../config/stripe');

// Create payment intent for room booking
exports.createRoomPaymentIntent = async (req, res) => {
    try {
        const { amount, currency = 'usd', roomId, bookingDetails } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency,
            metadata: {
                roomId,
                bookingDetails: JSON.stringify(bookingDetails)
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create payment intent for menu order
exports.createMenuPaymentIntent = async (req, res) => {
    try {
        const { amount, currency = 'pkr', orderItems, paymentMethodId } = req.body;

        if (!amount || !paymentMethodId || !orderItems) {
            return res.status(400).json({
                success: false,
                message: 'Missing required payment information'
            });
        }

        console.log('Creating payment intent with:', {
            amount,
            currency,
            orderItems,
            paymentMethodId
        });

        // First create the payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            payment_method_types: ['card'],
            metadata: {
                orderItems: JSON.stringify(orderItems)
            }
        });

        console.log('Payment intent created:', paymentIntent.id);

        // Then confirm the payment intent with the payment method
        const confirmedPaymentIntent = await stripe.paymentIntents.confirm(
            paymentIntent.id,
            {
                payment_method: paymentMethodId,
            }
        );

        console.log('Payment intent confirmed:', confirmedPaymentIntent.status);

        // Check the payment intent status
        if (confirmedPaymentIntent.status === 'succeeded') {
            res.json({
                success: true,
                paymentIntent: confirmedPaymentIntent
            });
        } else {
            res.status(400).json({
                success: false,
                message: `Payment failed with status: ${confirmedPaymentIntent.status}`,
                paymentIntent: confirmedPaymentIntent
            });
        }
    } catch (error) {
        console.error('Stripe payment error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Payment processing failed'
        });
    }
};

// Create payment intent for table reservation
exports.createTablePaymentIntent = async (req, res) => {
    try {
        const { amount, currency = 'usd', tableId, reservationDetails } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency,
            metadata: {
                tableId,
                reservationDetails: JSON.stringify(reservationDetails)
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Handle successful payment webhook
exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            // Handle successful payment
            // Update your database accordingly
            break;
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            // Handle failed payment
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};

const createPaymentIntent = async (req, res) => {
    try {
        const { amount, currency = 'usd' } = req.body;

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
};

const confirmPayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status === 'succeeded') {
            res.status(200).json({
                success: true,
                paymentIntent: paymentIntent
            });
        } else {
            res.status(400).json({
                success: false,
                message: `Payment status is ${paymentIntent.status}`
            });
        }
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createPaymentIntent,
    confirmPayment,
    createRoomPaymentIntent: exports.createRoomPaymentIntent,
    createMenuPaymentIntent: exports.createMenuPaymentIntent,
    createTablePaymentIntent: exports.createTablePaymentIntent,
    handleWebhook: exports.handleWebhook
}; 