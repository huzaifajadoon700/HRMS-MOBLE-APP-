const nodemailer = require('nodemailer');
const twilio = require('twilio');

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

async function sendSMS(to, message) {
  try {
    await twilioClient.messages.create({
      body: message,
      to,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    return true;
  } catch (error) {
    console.error('SMS sending error:', error);
    return false;
  }
}

async function sendOrderNotification(order, event) {
  const user = await User.findById(order.userId);
  if (!user) return;

  const orderNumber = order._id.slice(-6);
  const orderTotal = order.totalPrice.toFixed(2);

  // Email templates
  const emailTemplates = {
    created: {
      subject: `Order #${orderNumber} Confirmed`,
      html: `
        <h2>Order Confirmation</h2>
        <p>Thank you for your order! Your order #${orderNumber} has been confirmed.</p>
        <p>Total Amount: Rs. ${orderTotal}</p>
        <p>We'll notify you when your order is ready for delivery.</p>
      `
    },
    status_updated: {
      subject: `Order #${orderNumber} Status Update`,
      html: `
        <h2>Order Status Update</h2>
        <p>Your order #${orderNumber} status has been updated to: ${order.status}</p>
        <p>Delivery Status: ${order.deliveryStatus}</p>
      `
    },
    delivered: {
      subject: `Order #${orderNumber} Delivered`,
      html: `
        <h2>Order Delivered</h2>
        <p>Your order #${orderNumber} has been delivered successfully!</p>
        <p>We hope you enjoyed your meal. Please rate your experience.</p>
      `
    },
    cancelled: {
      subject: `Order #${orderNumber} Cancelled`,
      html: `
        <h2>Order Cancelled</h2>
        <p>Your order #${orderNumber} has been cancelled.</p>
        <p>If you have any questions, please contact our support team.</p>
      `
    }
  };

  // SMS templates
  const smsTemplates = {
    created: `Order #${orderNumber} confirmed! Total: Rs. ${orderTotal}. We'll notify you when it's ready.`,
    status_updated: `Order #${orderNumber} status: ${order.status}. Delivery: ${order.deliveryStatus}`,
    delivered: `Order #${orderNumber} delivered! Hope you enjoyed your meal. Please rate your experience.`,
    cancelled: `Order #${orderNumber} cancelled. Contact support if you have questions.`
  };

  // Send notifications
  if (user.email) {
    await sendEmail(
      user.email,
      emailTemplates[event].subject,
      emailTemplates[event].html
    );
  }

  if (user.phone) {
    await sendSMS(user.phone, smsTemplates[event]);
  }

  // Send notification to admin
  await sendEmail(
    process.env.ADMIN_EMAIL,
    `Order #${orderNumber} ${event}`,
    `
      <h2>Order ${event}</h2>
      <p>Order #${orderNumber}</p>
      <p>Customer: ${user.name}</p>
      <p>Total: Rs. ${orderTotal}</p>
      <p>Status: ${order.status}</p>
      <p>Delivery Status: ${order.deliveryStatus}</p>
    `
  );
}

async function sendDeliveryNotification(driver, order) {
  const user = await User.findById(order.userId);
  if (!user) return;

  const orderNumber = order._id.slice(-6);
  const deliveryTime = new Date(order.estimatedDeliveryTime).toLocaleString();

  // Send SMS to customer
  if (user.phone) {
    await sendSMS(
      user.phone,
      `Your order #${orderNumber} is on the way! Estimated delivery: ${deliveryTime}. Driver: ${driver.name}`
    );
  }

  // Send SMS to driver
  if (driver.phone) {
    await sendSMS(
      driver.phone,
      `New delivery assignment: Order #${orderNumber}. Customer: ${user.name}. Address: ${order.deliveryAddress}`
    );
  }
}

module.exports = {
  sendOrderNotification,
  sendDeliveryNotification
}; 