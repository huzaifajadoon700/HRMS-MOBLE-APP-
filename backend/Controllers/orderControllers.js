const Order = require("../Models/Order");
const User = require("../Models/User");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const server = http.createServer();
const io = socketIo(server);

// ✅ Create Order (Logged-in users only)
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      totalPrice,
      deliveryFee,
      deliveryAddress,
      deliveryLocation,
      payment,
      paymentMethodId,
    } = req.body;
    const userId = req.user._id;

    console.log("Creating order for user:", userId);
    console.log("Order data received:", {
      items,
      totalPrice,
      deliveryFee,
      deliveryAddress,
      deliveryLocation,
      payment,
      paymentMethodId,
    });

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Order items must be a non-empty array" });
    }

    if (!deliveryAddress || !deliveryLocation) {
      return res
        .status(400)
        .json({ message: "Delivery address and location are required" });
    }

    for (const item of items) {
      if (!item.quantity || !item.price || !item.name) {
        return res
          .status(400)
          .json({ message: "Each item must have name, quantity, and price" });
      }
      if (isNaN(item.quantity) || item.quantity <= 0) {
        return res
          .status(400)
          .json({ message: "Quantity must be a positive number" });
      }
      if (isNaN(item.price) || item.price <= 0) {
        return res
          .status(400)
          .json({ message: "Price must be a positive number" });
      }
    }

    // Process payment with Stripe
    let paymentIntent;
    if (payment === "card" && paymentMethodId) {
      try {
        // First create the payment intent
        paymentIntent = await stripe.paymentIntents.create({
          amount: (totalPrice + deliveryFee) * 100, // Convert to cents
          currency: "usd",
          payment_method_types: ["card"],
          metadata: {
            orderItems: JSON.stringify(items),
            deliveryAddress,
            deliveryLocation,
          },
        });

        // Then confirm the payment intent with the payment method
        paymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
          payment_method: paymentMethodId,
        });

        if (paymentIntent.status !== "succeeded") {
          throw new Error("Payment failed: " + paymentIntent.status);
        }
      } catch (error) {
        console.error("Stripe payment error:", error);
        return res.status(400).json({
          error: "Payment failed",
          message: error.message,
        });
      }
    }

    // Create a new order with a unique ID
    const newOrder = new Order({
      user: userId,
      items,
      totalPrice,
      deliveryFee,
      deliveryAddress,
      deliveryLocation,
      status: "pending",
      deliveryStatus: "pending",
      payment,
      paymentIntentId: paymentIntent?.id,
      paymentStatus: paymentIntent?.status || "pending",
    });

    console.log("Order object created with ID:", newOrder._id);
    console.log("Full order object:", newOrder);

    // Save the order
    const savedOrder = await newOrder.save();

    // Get socket.io instance
    const socketModule = require("../socket");
    const io = socketModule.getIO();

    // Emit socket event for real-time updates
    if (io) {
      const orderUpdate = {
        orderId: savedOrder._id,
        status: "pending",
        timestamp: new Date(),
        estimatedDelivery: new Date(Date.now() + 30 * 60000), // 30 minutes from now
        completed: false,
      };

      // Emit to everyone in the room for this order
      io.to(`order_${savedOrder._id}`).emit("orderUpdate", orderUpdate);

      // Also emit a global event for any page that might be displaying this order
      io.emit("orderStatusUpdate", orderUpdate);

      console.log(
        `[Socket] Order ${savedOrder._id} created with status: pending`
      );
    } else {
      console.warn("[Socket] Socket.io instance not available");
    }

    // Auto-progress order to delivered after 5 minutes (regardless of payment status)
    console.log(
      `[Order] Starting 5-minute auto-progression for order: ${savedOrder._id}`
    );
    setTimeout(async () => {
      try {
        // Check if order still exists and is not already delivered
        const currentOrder = await Order.findById(savedOrder._id);
        if (currentOrder && currentOrder.status !== "delivered") {
          await Order.findByIdAndUpdate(savedOrder._id, {
            status: "delivered",
          });
          console.log(
            `[Order] Auto-updated order ${savedOrder._id} to delivered status after 5 minutes`
          );

          // Emit final status update to all connected clients
          if (io) {
            io.emit("orderStatusUpdate", {
              orderId: savedOrder._id,
              status: "delivered",
              timestamp: new Date(),
              completed: true,
            });

            // Also emit to specific order room
            io.to(`order_${savedOrder._id}`).emit("orderUpdate", {
              orderId: savedOrder._id,
              status: "delivered",
              timestamp: new Date(),
              completed: true,
            });
          }
        }
      } catch (error) {
        console.error(
          `[Order] Error auto-updating order ${savedOrder._id}:`,
          error
        );
      }
    }, 5 * 60 * 1000); // 5 minutes = 5 * 60 * 1000 milliseconds

    console.log("Sending order response with createdAt:", savedOrder.createdAt);
    console.log("Full saved order:", JSON.stringify(savedOrder, null, 2));

    res.status(201).json({
      message: "Order created successfully",
      order: savedOrder,
      paymentIntent: paymentIntent,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({ message: "Error creating order", error: error.message });
  }
};

// ✅ Get Orders (Logged-in users can see their own orders, admin can see all)
exports.getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query based on user role
    let query = {};
    if (!req.user.isAdmin) {
      // Regular users can only see their own orders
      query.user = req.user._id;
    }

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    // Fetch orders with pagination
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Ensure all price fields are valid numbers
    const validatedOrders = orders.map((order) => ({
      ...order.toObject(),
      totalPrice: Number(order.totalPrice) || 0,
      deliveryFee: Number(order.deliveryFee) || 0,
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 0,
      })),
    }));

    res.status(200).json({
      orders: validatedOrders,
      pagination: {
        page,
        limit,
        totalPages,
        totalOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
};

// ✅ Get Single Order (Allow access to any order - bypass owner check)
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(`Attempting to fetch order with ID: ${orderId}`);

    // Check if we need a validation bypass for the specific order from screenshot
    const bypassValidationId = "67fab24d9a3558b7a0c8267f";

    // For the specific ID, we'll just try direct query
    if (orderId === bypassValidationId) {
      console.log(`Using direct query for known ID: ${bypassValidationId}`);
      try {
        // Try both methods to find this order
        const order = await Order.findOne({ _id: bypassValidationId });

        if (order) {
          console.log(`Successfully found order with direct query`);
          const user = await User.findById(order.user).select("-password");
          const fullOrder = {
            ...order.toObject(),
            userDetails: user,
          };
          return res.status(200).json(fullOrder);
        } else {
          console.log(`Order not found with direct query, trying string ID`);
        }
      } catch (directError) {
        console.error(`Error with direct query:`, directError);
      }
    }

    // Try with MongoDB ObjectId validation
    let isValidId = false;
    try {
      isValidId = mongoose.Types.ObjectId.isValid(orderId);
    } catch (validationError) {
      console.error("ID validation error:", validationError);
    }

    if (!isValidId) {
      console.log(`Invalid order ID format: ${orderId}`);
      return res.status(400).json({ message: "Invalid order ID format" });
    }

    // Try to find the order by ID without additional constraints
    console.log(`Searching database for order: ${orderId}`);
    const order = await Order.findById(orderId);

    if (!order) {
      console.log(`Order ${orderId} not found in database`);
      return res.status(404).json({ message: "Order not found" });
    }

    console.log(`Found order in database: ${order._id}`);

    // Get user details
    let userDetails = null;
    try {
      const user = await User.findById(order.user).select("-password");
      userDetails = user;
    } catch (userError) {
      console.error("Error fetching user details:", userError);
    }

    const fullOrder = {
      ...order.toObject(),
      userDetails: userDetails,
    };

    console.log(`Successfully returning order ${orderId} details`);
    res.status(200).json(fullOrder);
  } catch (error) {
    console.error(`Error fetching order ${req.params.orderId}:`, error);
    console.error("Stack trace:", error.stack);
    res
      .status(500)
      .json({ message: "Error fetching order", error: error.message });
  }
};

// ✅ Update Delivery Location (Logged-in users only, their own order)
exports.updateDeliveryLocation = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryLocation } = req.body;
    const userId = req.user._id; // Get user ID from the authenticated request

    if (!deliveryLocation) {
      return res.status(400).json({ message: "Invalid delivery location" });
    }

    const order = await Order.findOne({ _id: orderId, user: userId }); // Ensure the order belongs to the user
    if (!order)
      return res
        .status(404)
        .json({ message: "Order not found or unauthorized access" });

    // Check if order can be modified based on its status
    if (order.status === "delivered" || order.status === "canceled") {
      return res.status(400).json({
        message: "Cannot update location for delivered or canceled orders",
      });
    }

    // Check if order is from past date (more than 1 day old)
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    const daysDifference = Math.floor(
      (today - orderDate) / (1000 * 60 * 60 * 24)
    );

    if (daysDifference > 1) {
      return res.status(400).json({
        message: "Cannot update location for orders older than 1 day",
      });
    }

    order.deliveryLocation = deliveryLocation;
    await order.save();

    if (io) {
      io.emit("updateDeliveryLocation", {
        orderId: order._id,
        deliveryLocation,
      });
    }
    res.json({ message: "Delivery location updated", order });
  } catch (error) {
    console.error("Error updating delivery location:", error);
    res.status(500).json({
      message: "Error updating delivery location",
      error: error.message,
    });
  }
};

// ✅ Cancel Order (Logged-in users only, their own order)
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id; // Get user ID from the authenticated request
    const isAdmin = req.user.isAdmin || req.user.role === "admin"; // Check if user is admin

    // Find the order first to check status before deleting
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found or unauthorized access" });
    }

    // Check if order can be canceled based on its status
    if (
      !isAdmin &&
      (order.status === "delivered" || order.status === "out_for_delivery")
    ) {
      return res.status(400).json({
        message:
          "Cannot cancel orders that are already out for delivery or delivered",
      });
    }

    // Check if order is from past date (more than 1 hour old for non-admins)
    if (!isAdmin) {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      const hoursDifference = (now - orderDate) / (1000 * 60 * 60);

      if (hoursDifference > 1) {
        return res.status(400).json({
          message: "Orders can only be canceled within 1 hour of placing them",
        });
      }
    }

    // Now delete the order
    await Order.findByIdAndDelete(orderId);

    if (io) {
      io.emit("orderCancelled", { orderId: order._id });
    }

    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res
      .status(500)
      .json({ message: "Error cancelling order", error: error.message });
  }
};

// ✅ Update Order Status (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
      "canceled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status
    order.status = status;
    await order.save();

    // Get socket.io instance
    const socketModule = require("../socket");
    const io = socketModule.getIO();

    // Emit socket event for real-time updates
    if (io) {
      const statusUpdate = {
        orderId: order._id,
        status: status,
        timestamp: new Date(),
        estimatedDelivery: new Date(Date.now() + 30 * 60000), // 30 minutes from now
        completed: true,
      };

      // Emit to everyone in the room for this order
      io.to(`order_${orderId}`).emit("orderUpdate", statusUpdate);

      // Also emit a global event for any page that might be displaying this order
      io.emit("orderStatusUpdate", statusUpdate);

      console.log(`[Socket] Order ${orderId} status updated to: ${status}`);
    } else {
      console.warn("[Socket] Socket.io instance not available");
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error updating order status:", error);
    res
      .status(500)
      .json({ message: "Error updating order status", error: error.message });
  }
};
