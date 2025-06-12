const mongoose = require('mongoose');

const userFoodInteractionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
        required: true
    },
    interactionType: {
        type: String,
        enum: ['rating', 'order', 'view', 'favorite'],
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: function() { return this.interactionType === 'rating'; }
    },
    orderQuantity: {
        type: Number,
        default: 1
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    // Automatically cleanup interactions older than 30 days
    expiresAt: {
        type: Date,
        default: Date.now,
        expires: 2592000 // 30 days in seconds
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
userFoodInteractionSchema.index({ userId: 1, timestamp: -1 });
userFoodInteractionSchema.index({ menuItemId: 1, timestamp: -1 });
userFoodInteractionSchema.index({ userId: 1, interactionType: 1 });

module.exports = mongoose.model('UserFoodInteraction', userFoodInteractionSchema);
