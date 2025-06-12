const mongoose = require("mongoose");

// Check if the model already exists to prevent recompilation
const Reservation = mongoose.models.Reservation || mongoose.model("Reservation", new mongoose.Schema({
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: "Table", required: true },
  tableNumber: { type: String, required: true },
  reservationDate: { type: String, required: true },
  time: { type: String, required: true },
  endTime: { type: String, required: true },
  guests: { type: Number, required: true },
  payment: { type: String, enum: ["card", "paypal"], required: true },
  totalPrice: { type: Number, required: true },
  phone: { type: String, default: null },
  fullName: { type: String, default: null },
  email: { type: String, default: null },
  specialRequests: { type: String, default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true }, // Associate reservation with users model
  paymentIntentId: { type: String, default: null },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'succeeded', 'failed', 'refunded'],
    default: 'pending'
  },
  refundStatus: {
    type: String,
    enum: ['none', 'requested', 'completed', 'failed'],
    default: 'none'
  }
}, {
  timestamps: true
}));

module.exports = Reservation;