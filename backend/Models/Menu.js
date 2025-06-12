const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    availability: {
        type: Boolean,
        default: true,
    },
    image: {
        type: String,
        default: null,
    },

    // New fields for recommendation system
    ingredients: {
        type: [String],
        default: []
    },
    cuisine: {
        type: String,
        default: 'Pakistani'
    },
    spiceLevel: {
        type: String,
        enum: ['mild', 'medium', 'hot', 'very_hot'],
        default: 'medium'
    },
    dietaryTags: {
        type: [String],
        enum: ['vegetarian', 'vegan', 'halal', 'gluten-free', 'dairy-free'],
        default: ['halal'] // Default for Pakistani cuisine
    },
    preparationTime: {
        type: Number, // in minutes
        default: 30
    },
    nutritionalInfo: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fat: { type: Number, default: 0 }
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    popularityScore: {
        type: Number,
        default: 0
    },
    isRecommended: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for recommendation queries
MenuSchema.index({ cuisine: 1, spiceLevel: 1 });
MenuSchema.index({ category: 1, averageRating: -1 });
MenuSchema.index({ popularityScore: -1, averageRating: -1 });
MenuSchema.index({ dietaryTags: 1 });

module.exports = mongoose.model('Menu', MenuSchema);
