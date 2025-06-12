// /models/tableModel.js
const mongoose = require('mongoose');

// Check if the model already exists to prevent recompilation
const Table = mongoose.models.Table || mongoose.model('Table', new mongoose.Schema({
  tableName: {
    type: String,
    required: true,
    trim: true
  },
  tableType: {
    type: String,
    required: true,
    enum: ['indoor', 'outdoor', 'private', 'Standard', 'Premium', 'VIP', 'Booth', 'Counter']
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    required: true,
    enum: ['Available', 'Booked', 'Reserved'],
    default: 'Available'
  },
  image: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  // Enhanced fields for recommendation system
  location: {
    type: String,
    enum: ['Window', 'Garden', 'Main Hall', 'Private Room', 'Bar Area', 'Terrace', 'Corner', 'Center'],
    default: 'Main Hall'
  },
  ambiance: {
    type: String,
    enum: ['Romantic', 'Casual', 'Formal', 'Lively', 'Quiet', 'Intimate', 'Social'],
    default: 'Casual'
  },
  hasWindowView: {
    type: Boolean,
    default: false
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  hasSpecialLighting: {
    type: Boolean,
    default: false
  },
  accessibilityFriendly: {
    type: Boolean,
    default: false
  },
  priceTier: {
    type: String,
    enum: ['Budget', 'Mid-range', 'Premium'],
    default: 'Mid-range'
  },
  features: [{
    type: String
  }],
  avgRating: {
    type: Number,
    default: 4.0,
    min: 1,
    max: 5
  },
  totalBookings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
}));

// Add index for faster queries if not already added
if (!Table.schema.path('tableName')._index) {
  Table.schema.index({ tableName: 1 });
}
if (!Table.schema.path('status')._index) {
  Table.schema.index({ status: 1 });
}

module.exports = Table;
