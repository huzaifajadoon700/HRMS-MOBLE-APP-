const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function processPayment(paymentMethod, amount) {
  try {
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'pkr',
      payment_method: paymentMethod,
      confirm: true
    });

    return {
      success: true,
      paymentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret
    };
  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

async function verifyPayment(paymentId) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
    return {
      success: paymentIntent.status === 'succeeded',
      status: paymentIntent.status
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

async function processRefund(paymentId, amount) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentId,
      amount: amount * 100 // Convert to cents
    });

    return {
      success: true,
      refundId: refund.id
    };
  } catch (error) {
    console.error('Refund processing error:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

async function splitPayment(orderAmount, driverAmount) {
  try {
    // Create transfer to driver
    const transfer = await stripe.transfers.create({
      amount: driverAmount * 100, // Convert to cents
      currency: 'pkr',
      destination: process.env.DRIVER_STRIPE_ACCOUNT_ID
    });

    return {
      success: true,
      transferId: transfer.id,
      restaurantAmount: orderAmount - driverAmount
    };
  } catch (error) {
    console.error('Split payment error:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

async function getPaymentHistory(customerId) {
  try {
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 100
    });

    return {
      success: true,
      payments: paymentIntents.data
    };
  } catch (error) {
    console.error('Payment history error:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

module.exports = {
  processPayment,
  verifyPayment,
  processRefund,
  splitPayment,
  getPaymentHistory
}; 