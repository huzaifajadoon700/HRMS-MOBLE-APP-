// Models/UserRoomInteraction.js
const mongoose = require('mongoose');

const userRoomInteractionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  interactionType: {
    type: String,
    enum: ['view', 'booking', 'rating', 'inquiry', 'favorite'],
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
  bookingDuration: {
    type: Number, // Duration in days
    required: function() {
      return this.interactionType === 'booking';
    }
  },
  groupSize: {
    type: Number,
    min: 1,
    default: 1
  },
  checkInDate: {
    type: Date,
    required: function() {
      return this.interactionType === 'booking';
    }
  },
  checkOutDate: {
    type: Date,
    required: function() {
      return this.interactionType === 'booking';
    }
  },
  priceAtInteraction: {
    type: Number // Room price at the time of interaction
  },
  deviceType: {
    type: String,
    enum: ['mobile', 'desktop', 'tablet'],
    default: 'desktop'
  },
  sessionId: {
    type: String // For tracking user sessions
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userRoomInteractionSchema.index({ userId: 1, timestamp: -1 });
userRoomInteractionSchema.index({ roomId: 1, timestamp: -1 });
userRoomInteractionSchema.index({ userId: 1, interactionType: 1 });
userRoomInteractionSchema.index({ timestamp: -1 });

// Virtual for interaction age in days
userRoomInteractionSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.timestamp) / (1000 * 60 * 60 * 24));
});

// Static method to get user's recent interactions
userRoomInteractionSchema.statics.getRecentInteractions = function(userId, days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.find({
    userId,
    timestamp: { $gte: startDate }
  }).populate('roomId').sort({ timestamp: -1 });
};

// Static method to get room's interaction stats
userRoomInteractionSchema.statics.getRoomStats = function(roomId, days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.aggregate([
    {
      $match: {
        roomId: mongoose.Types.ObjectId(roomId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$interactionType',
        count: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
};

// Instance method to calculate interaction weight for recommendations
userRoomInteractionSchema.methods.getInteractionWeight = function() {
  const weights = {
    'view': 1,
    'inquiry': 2,
    'favorite': 3,
    'booking': 5,
    'rating': 4
  };
  
  let weight = weights[this.interactionType] || 1;
  
  // Boost weight for high ratings
  if (this.rating && this.rating >= 4) {
    weight *= 1.5;
  }
  
  // Reduce weight for older interactions
  const ageInDays = this.ageInDays;
  if (ageInDays > 7) {
    weight *= Math.max(0.5, 1 - (ageInDays / 30));
  }
  
  return weight;
};

// Pre-save middleware to set price at interaction
userRoomInteractionSchema.pre('save', async function(next) {
  if (this.isNew && !this.priceAtInteraction) {
    try {
      const Room = mongoose.model('Room');
      const room = await Room.findById(this.roomId);
      if (room) {
        this.priceAtInteraction = room.price;
      }
    } catch (error) {
      console.error('Error setting price at interaction:', error);
    }
  }
  next();
});

const UserRoomInteraction = mongoose.model('UserRoomInteraction', userRoomInteractionSchema);

module.exports = UserRoomInteraction;
