// Models/RoomRecommendation.js
const mongoose = require('mongoose');

const roomRecommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recommendedRooms: [{
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 5
    },
    reason: {
      type: String,
      enum: ['collaborative_filtering', 'content_based', 'popularity', 'hybrid'],
      required: true
    },
    confidence: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    rank: {
      type: Number,
      required: true
    }
  }],
  userPreferences: {
    avgRating: { type: Number, default: 0 },
    totalInteractions: { type: Number, default: 0 },
    preferredRoomTypes: { type: Map, of: Number },
    preferredPriceRanges: { type: Map, of: Number },
    avgGroupSize: { type: Number, default: 0 },
    avgBookingDuration: { type: Number, default: 0 },
    ratingDistribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    }
  },
  generationMethod: {
    type: String,
    enum: ['ml_model', 'hybrid_algorithm', 'fallback'],
    default: 'hybrid_algorithm'
  },
  modelVersion: {
    type: String,
    default: '1.0'
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }
  },
  clickedRooms: [{
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    },
    clickedAt: {
      type: Date,
      default: Date.now
    },
    rank: Number
  }],
  bookedRooms: [{
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    },
    bookedAt: {
      type: Date,
      default: Date.now
    },
    rank: Number
  }],
  feedback: {
    helpful: { type: Boolean },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    submittedAt: { type: Date }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
roomRecommendationSchema.index({ userId: 1, generatedAt: -1 });
roomRecommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
roomRecommendationSchema.index({ userId: 1, 'recommendedRooms.roomId': 1 });

// Virtual for recommendation freshness
roomRecommendationSchema.virtual('isFresh').get(function() {
  const oneHour = 60 * 60 * 1000;
  return (Date.now() - this.generatedAt) < oneHour;
});

// Virtual for click-through rate
roomRecommendationSchema.virtual('clickThroughRate').get(function() {
  if (this.recommendedRooms.length === 0) return 0;
  return (this.clickedRooms.length / this.recommendedRooms.length) * 100;
});

// Virtual for conversion rate
roomRecommendationSchema.virtual('conversionRate').get(function() {
  if (this.recommendedRooms.length === 0) return 0;
  return (this.bookedRooms.length / this.recommendedRooms.length) * 100;
});

// Static method to get user's recommendation history
roomRecommendationSchema.statics.getUserHistory = function(userId, limit = 10) {
  return this.find({ userId })
    .populate('recommendedRooms.roomId')
    .sort({ generatedAt: -1 })
    .limit(limit);
};

// Static method to get recommendation analytics
roomRecommendationSchema.statics.getAnalytics = function(days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        generatedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRecommendations: { $sum: 1 },
        totalRoomsRecommended: { $sum: { $size: '$recommendedRooms' } },
        totalClicks: { $sum: { $size: '$clickedRooms' } },
        totalBookings: { $sum: { $size: '$bookedRooms' } },
        avgUserInteractions: { $avg: '$userPreferences.totalInteractions' },
        avgUserRating: { $avg: '$userPreferences.avgRating' }
      }
    },
    {
      $project: {
        totalRecommendations: 1,
        totalRoomsRecommended: 1,
        totalClicks: 1,
        totalBookings: 1,
        avgUserInteractions: { $round: ['$avgUserInteractions', 2] },
        avgUserRating: { $round: ['$avgUserRating', 2] },
        clickThroughRate: {
          $round: [
            { $multiply: [{ $divide: ['$totalClicks', '$totalRoomsRecommended'] }, 100] },
            2
          ]
        },
        conversionRate: {
          $round: [
            { $multiply: [{ $divide: ['$totalBookings', '$totalRoomsRecommended'] }, 100] },
            2
          ]
        }
      }
    }
  ]);
};

// Instance method to record room click
roomRecommendationSchema.methods.recordClick = function(roomId) {
  const roomIndex = this.recommendedRooms.findIndex(
    room => room.roomId.toString() === roomId.toString()
  );
  
  if (roomIndex !== -1) {
    this.clickedRooms.push({
      roomId: roomId,
      rank: roomIndex + 1,
      clickedAt: new Date()
    });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Instance method to record room booking
roomRecommendationSchema.methods.recordBooking = function(roomId) {
  const roomIndex = this.recommendedRooms.findIndex(
    room => room.roomId.toString() === roomId.toString()
  );
  
  if (roomIndex !== -1) {
    this.bookedRooms.push({
      roomId: roomId,
      rank: roomIndex + 1,
      bookedAt: new Date()
    });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Instance method to submit feedback
roomRecommendationSchema.methods.submitFeedback = function(feedbackData) {
  this.feedback = {
    ...feedbackData,
    submittedAt: new Date()
  };
  return this.save();
};

// Pre-save middleware to set ranks
roomRecommendationSchema.pre('save', function(next) {
  if (this.isModified('recommendedRooms')) {
    this.recommendedRooms.forEach((room, index) => {
      room.rank = index + 1;
    });
  }
  next();
});

const RoomRecommendation = mongoose.model('RoomRecommendation', roomRecommendationSchema);

module.exports = RoomRecommendation;
