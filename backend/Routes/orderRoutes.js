const express = require("express");
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require("../Middlewares/Auth");
const {
  createOrder,
  getOrders,
  getOrderById,
  updateDeliveryLocation,
  cancelOrder,
  updateOrderStatus
} = require("../Controllers/orderControllers");

// ✅ Create Order (Logged-in users only)
router.post("/", ensureAuthenticated, createOrder);

// ✅ Get Orders (Logged-in users can see their own orders, admin can see all)
router.get("/", ensureAuthenticated, getOrders);

// ✅ Get Single Order (Any authenticated user can access any order temporarily to fix issues)
router.get("/:orderId", ensureAuthenticated, getOrderById);

// ✅ Update Order Status (Admin only)
router.patch("/:orderId/status", ensureAuthenticated, updateOrderStatus);

// ✅ Update Delivery Location (Any authenticated user can update for now)
router.put("/:orderId/delivery-location", ensureAuthenticated, updateDeliveryLocation);

// ✅ Cancel Order (Any authenticated user can cancel for now)
router.delete("/:orderId", ensureAuthenticated, cancelOrder);

module.exports = router;