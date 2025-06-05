const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  sentiment: {
    type: String,
    enum: ['positive', 'slightly_positive', 'neutral', 'slightly_negative', 'negative'],
    required: true
  },
  sentimentScore: {
    type: Number,
    required: true,
    min: -1,
    max: 1
  },
  sentimentConfidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  processedTokens: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Check if the model already exists before defining it
const FeedbackModel = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

module.exports = FeedbackModel; 