// Models/Room.js
const mongoose = require('mongoose');

// Check if the model already exists to prevent recompilation
const Room = mongoose.models.Room || mongoose.model('Room', new mongoose.Schema({
  roomNumber: { type: String, required: true },
  roomType: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, required: true, default: 'Available' },
  image: { type: String, required: false }, // Image path (optional)
}, {
  timestamps: true
}));

module.exports = Room;
