const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the User model
    ref: "User", // Reference to the User collection
    required: true, // Every order must be associated with a user
  },
  items: [
    {
      menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu'
        // Completely removed required field to fix mobile app issue
      },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      customizations: { type: String, default: '' },
      addOns: [{
        name: String,
        price: Number
      }]
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

// Clear any existing model to prevent caching issues
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

module.exports = mongoose.model("Order", orderSchema);