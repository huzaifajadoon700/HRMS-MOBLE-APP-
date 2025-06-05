const express = require("express");
const router = express.Router();
const Order = require("../Models/Order");

// Get delivery status by order ID
router.get("/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({
      orderId: order._id,
      status: order.status, // Example: Pending, In Progress, Out for Delivery, Delivered
      estimatedTime: order.estimatedTime || "N/A",
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching delivery status", error: error.message });
  }
});

// Update order delivery status (Admin Only)
router.put("/:orderId", async (req, res) => {
  try {
    const { status, estimatedTime } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status, estimatedTime },
      { new: true }
    );

    res.status(200).json({ message: "Order status updated", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: "Error updating delivery status", error: error.message });
  }
});

module.exports = router;
