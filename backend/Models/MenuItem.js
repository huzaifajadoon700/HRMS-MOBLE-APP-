const mongoose = require('mongoose');

const addOnSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    available: {
        type: Boolean,
        default: true
    }
});

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    available: {
        type: Boolean,
        default: true
    },
    addOns: [addOnSchema],
    preparationTime: {
        type: Number,  // in minutes
        required: true
    },
    isVegetarian: {
        type: Boolean,
        default: false
    },
    isSpicy: {
        type: Boolean,
        default: false
    },
    customizationNotes: {
        type: String
    }
}, {
    timestamps: true
}); 