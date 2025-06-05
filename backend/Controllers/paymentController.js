const stripe = require("../config/stripe");

// Create payment intent for room booking
exports.createRoomPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = "usd", roomId, bookingDetails } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      payment_method_types: ["card"], // Only accept card payments
      metadata: {
        roomId,
        bookingDetails: JSON.stringify(bookingDetails),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create payment intent for menu order
exports.createMenuPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = "usd", orderItems, paymentMethodId } = req.body;

    if (!amount || !paymentMethodId || !orderItems) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment information",
      });
    }

    console.log("Creating payment intent with:", {
      amount,
      currency,
      orderItems,
      paymentMethodId,
    });

    // First create the payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      payment_method_types: ["card"], // Only accept card payments
      metadata: {
        orderItems: JSON.stringify(orderItems),
      },
    });

    console.log("Payment intent created:", paymentIntent.id);

    // Then confirm the payment intent with the payment method
    const confirmedPaymentIntent = await stripe.paymentIntents.confirm(
      paymentIntent.id,
      {
        payment_method: paymentMethodId,
      }
    );

    console.log("Payment intent confirmed:", confirmedPaymentIntent.status);

    // Check the payment intent status
    if (confirmedPaymentIntent.status === "succeeded") {
      res.json({
        success: true,
        paymentIntent: confirmedPaymentIntent,
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Payment failed with status: ${confirmedPaymentIntent.status}`,
        paymentIntent: confirmedPaymentIntent,
      });
    }
  } catch (error) {
    console.error("Stripe payment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Payment processing failed",
    });
  }
};

// Create payment intent for table reservation
exports.createTablePaymentIntent = async (req, res) => {
  try {
    const { amount, currency = "usd", tableId, reservationDetails } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
      payment_method_types: ["card"], // Only accept card payments
      metadata: {
        tableId,
        reservationDetails: JSON.stringify(reservationDetails),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handle successful payment webhook
exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
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
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      // Handle successful payment
      // Update your database accordingly
      break;
    case "payment_intent.payment_failed":
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
    const { amount, currency = "usd" } = req.body;

    if (!amount) {
      console.log("Missing amount in request");
      return res.status(400).json({ error: "Amount is required" });
    }

    console.log(`Creating payment intent for amount: $${amount} ${currency}`);

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      payment_method_types: ["card"], // Only accept card payments
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

    // If we have card details, this is a web confirmation
    if (clientSecret && cardNumber) {
      console.log("Processing card payment confirmation");

      // Validate test card numbers
      if (
        cardNumber !== "4242424242424242" &&
        cardNumber !== "5555555555554444"
      ) {
        console.log("Invalid card number provided:", cardNumber);
        return res.status(400).json({
          success: false,
          message:
            "Invalid test card number. Use 4242424242424242 or 5555555555554444",
        });
      }

      console.log("Valid test card detected, confirming with Stripe");

      // Extract payment intent ID from client secret
      let piId;
      try {
        if (clientSecret.includes("_secret_")) {
          piId = clientSecret.split("_secret_")[0];
        } else {
          piId = clientSecret;
        }

        console.log("Extracted payment intent ID:", piId);

        if (!piId || piId.length === 0) {
          throw new Error("Invalid client secret format");
        }
      } catch (error) {
        console.error("Error extracting payment intent ID:", error);
        return res.status(400).json({
          success: false,
          message: "Invalid client secret format",
        });
      }

      // Use Stripe test tokens instead of raw card data
      console.log("Using Stripe test token for card confirmation");

      // Map test card numbers to Stripe test tokens
      let testToken;
      if (cardNumber === "4242424242424242") {
        testToken = "pm_card_visa"; // Stripe's test token for Visa
      } else if (cardNumber === "5555555555554444") {
        testToken = "pm_card_mastercard"; // Stripe's test token for Mastercard
      } else {
        return res.status(400).json({
          success: false,
          message:
            "Invalid test card. Use 4242424242424242 (Visa) or 5555555555554444 (Mastercard)",
        });
      }

      console.log("Using test payment method:", testToken);

      // Confirm the payment intent with the test token
      console.log("Confirming payment intent with Stripe:", piId);

      const confirmedPaymentIntent = await stripe.paymentIntents.confirm(piId, {
        payment_method: testToken,
      });

      console.log("Stripe confirmation result:", confirmedPaymentIntent.status);

      if (confirmedPaymentIntent.status === "succeeded") {
        return res.status(200).json({
          success: true,
          paymentIntentId: confirmedPaymentIntent.id,
          paymentIntent: confirmedPaymentIntent,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: `Payment failed with status: ${confirmedPaymentIntent.status}`,
        });
      }
    }

    // Legacy confirmation by payment intent ID
    if (paymentIntentId && paymentIntentId.length > 0) {
      console.log(
        "Processing legacy payment confirmation for ID:",
        paymentIntentId
      );

      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntentId
        );

        if (paymentIntent.status === "succeeded") {
          return res.status(200).json({
            success: true,
            paymentIntentId: paymentIntent.id,
            paymentIntent: paymentIntent,
          });
        } else {
          return res.status(400).json({
            success: false,
            message: `Payment status is ${paymentIntent.status}`,
          });
        }
      } catch (stripeError) {
        console.error("Error retrieving payment intent:", stripeError);
        return res.status(400).json({
          success: false,
          message: "Invalid payment intent ID",
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
  handleWebhook: exports.handleWebhook,
};
