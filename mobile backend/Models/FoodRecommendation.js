const mongoose = require('mongoose');

const foodRecommendationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    recommendedItems: [{
        menuItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Menu',
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
            enum: ['high', 'medium', 'low'],
            default: 'medium'
        }
    }],
    generatedAt: {
        type: Date,
        default: Date.now
    },
    // Cache recommendations for 1 hour
    expiresAt: {
        type: Date,
        default: Date.now,
        expires: 3600 // 1 hour in seconds
    },
    basedOnHistory: {
        type: Boolean,
        default: true
    },
    userPreferences: {
        avgRating: { type: Number, default: 0 },
        totalInteractions: { type: Number, default: 0 },
        preferredCuisines: { type: Map, of: Number, default: {} },
        spiceLevelPreference: { 
            type: String, 
            enum: ['mild', 'medium', 'hot', 'very_hot'],
            default: 'medium'
        }
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
foodRecommendationSchema.index({ userId: 1, generatedAt: -1 });
foodRecommendationSchema.index({ userId: 1, expiresAt: 1 });

module.exports = mongoose.model('FoodRecommendation', foodRecommendationSchema);
