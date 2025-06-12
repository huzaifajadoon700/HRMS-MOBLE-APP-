const mongoose = require('mongoose');

// Table Interaction Model for recommendation system
const tableInteractionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  interactionType: {
    type: String,
    enum: ['view', 'inquiry', 'favorite', 'share', 'rating', 'booking'],
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: function() {
      return this.interactionType === 'rating';
    }
  },
  sessionDuration: {
    type: Number, // in seconds
    default: 0,
    required: false
  },
  deviceType: {
    type: String,
    enum: ['mobile', 'desktop', 'tablet'],
    default: 'desktop'
  },
  source: {
    type: String,
    enum: ['search', 'recommendation', 'browse', 'direct', 'home_page', 'header_route'],
    default: 'browse'
  },
  context: {
    occasion: {
      type: String,
      enum: ['Romantic', 'Business', 'Family', 'Friends', 'Celebration', 'Casual']
    },
    partySize: {
      type: Number,
      min: 1
    },
    timeSlot: {
      type: String,
      enum: ['Lunch', 'Early Dinner', 'Prime Dinner', 'Late Dinner']
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Auto-expire after 30 days for GDPR compliance
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // 30 days in seconds
  }
}, {
  timestamps: true
});

// Indexes for better query performance
tableInteractionSchema.index({ userId: 1, timestamp: -1 });
tableInteractionSchema.index({ tableId: 1, timestamp: -1 });
tableInteractionSchema.index({ userId: 1, interactionType: 1 });
tableInteractionSchema.index({ timestamp: -1 });

// Check if model already exists to prevent recompilation
const TableInteraction = mongoose.models.TableInteraction || mongoose.model('TableInteraction', tableInteractionSchema);

module.exports = TableInteraction;
