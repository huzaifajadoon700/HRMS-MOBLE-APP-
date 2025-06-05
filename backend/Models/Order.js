const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the User model
    ref: "User", // Reference to the User collection
    required: true, // Every order must be associated with a user
  },
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  deliveryLocation: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "canceled"],
    default: "pending",
  },
  deliveryStatus: {
    type: String,
    enum: ["pending", "out_for_delivery", "delivered"],
    default: "pending",
  },
  estimatedDeliveryTime: { type: Date },
}, { timestamps: true });

// Add geospatial index for delivery location
orderSchema.index({ deliveryLocation: "2dsphere" });

module.exports = mongoose.model("Order", orderSchema);