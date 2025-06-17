const stripe = require('../config/stripe');

// Create payment intent for room booking
exports.createRoomPaymentIntent = async (req, res) => {
    try {
        const { amount, currency = 'pkr', roomId, bookingDetails } = req.body;

        console.log('Creating room payment intent:', { amount, currency, roomId });

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency,
            payment_method_types: ['card'],
            metadata: {
                roomId,
                bookingDetails: JSON.stringify(bookingDetails)
            }
        });

        console.log('Room payment intent created:', paymentIntent.id);

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Error creating room payment intent:', error);
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
        const { amount, currency = 'pkr', tableId, reservationDetails } = req.body;

        console.log('Creating table payment intent:', { amount, currency, tableId });

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency,
            payment_method_types: ['card'],
            metadata: {
                tableId,
                reservationDetails: JSON.stringify(reservationDetails)
            }
        });

        console.log('Table payment intent created:', paymentIntent.id);

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Error creating table payment intent:', error);
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
        console.log("Creating payment intent request received:", req.body);
        const { amount, currency = 'pkr' } = req.body;

        if (!amount) {
            console.log("Missing amount in request");
            return res.status(400).json({ error: "Amount is required" });
        }

        console.log(`Creating payment intent for amount: ${amount} ${currency}`);

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency,
            payment_method_types: ['card'], // Only accept card payments
        });

        console.log("Payment intent created successfully:", paymentIntent.id);

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).json({ error: error.message });
    }
};

const confirmPayment = async (req, res) => {
    try {
        console.log("Payment confirmation request received:", req.body);

        const {
            paymentIntentId,
            clientSecret,
            cardNumber,
            expiryMonth,
            expiryYear,
            cvc,
        } = req.body;

        // If we have a paymentIntentId, just retrieve and verify it
        if (paymentIntentId && !clientSecret) {
            console.log("Retrieving payment intent:", paymentIntentId);
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

            if (paymentIntent.status === "succeeded") {
                return res.status(200).json({
                    success: true,
                    paymentIntent: paymentIntent,
                    paymentIntentId: paymentIntent.id,
                    paymentMethodId: paymentIntent.payment_method
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: `Payment status is ${paymentIntent.status}`,
                });
            }
        }

        // If we have clientSecret and card details, process the payment
        if (clientSecret && cardNumber && expiryMonth && expiryYear && cvc) {
            console.log("Processing card payment with clientSecret:", clientSecret);

            // Extract payment intent ID from client secret
            const piId = clientSecret.split("_secret_")[0];
            console.log("Extracted payment intent ID:", piId);

            // Use Stripe test payment method tokens instead of raw card data
            let testPaymentMethodId;

            // Map common test card numbers to their corresponding test payment method tokens
            const cleanCardNumber = cardNumber.replace(/\s/g, "");
            switch (cleanCardNumber) {
                case "4242424242424242":
                    testPaymentMethodId = "pm_card_visa"; // Visa test token
                    break;
                case "5555555555554444":
                    testPaymentMethodId = "pm_card_mastercard"; // Mastercard test token
                    break;
                case "4000000000000002":
                    testPaymentMethodId = "pm_card_chargeDeclined"; // Declined card test token
                    break;
                default:
                    testPaymentMethodId = "pm_card_visa"; // Default to Visa test token
            }

            console.log("Using test payment method token:", testPaymentMethodId);

            // Confirm the payment intent with the test token
            console.log("Confirming payment intent with Stripe:", piId);

            const confirmedPaymentIntent = await stripe.paymentIntents.confirm(piId, {
                payment_method: testPaymentMethodId,
            });

            console.log("Stripe confirmation result:", confirmedPaymentIntent.status);

            if (confirmedPaymentIntent.status === "succeeded") {
                return res.status(200).json({
                    success: true,
                    paymentIntentId: confirmedPaymentIntent.id,
                    paymentIntent: confirmedPaymentIntent,
                    paymentMethodId: confirmedPaymentIntent.payment_method
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: `Payment failed with status: ${confirmedPaymentIntent.status}`,
                });
            }
        }

        // If we have clientSecret but no card details, try to retrieve the payment intent
        if (clientSecret) {
            console.log("Retrieving payment intent from clientSecret:", clientSecret);
            const piId = clientSecret.split("_secret_")[0];
            const paymentIntent = await stripe.paymentIntents.retrieve(piId);

            if (paymentIntent.status === "succeeded") {
                return res.status(200).json({
                    success: true,
                    paymentIntentId: paymentIntent.id,
                    paymentIntent: paymentIntent,
                    paymentMethodId: paymentIntent.payment_method
                });
            } else {
                return res.status(200).json({
                    success: false,
                    message: `Payment status: ${paymentIntent.status}`,
                });
            }
        }

        console.log("No valid payment information provided");
        return res.status(400).json({
            success: false,
            message: "Missing payment information",
        });
    } catch (error) {
        console.error("Error confirming payment:", error);
        return res.status(500).json({
            success: false,
            error: error.message,
        });
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