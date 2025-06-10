const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    image: {
        type: String, // Store the image URL
        default: ''
    },

    // Food recommendation preferences
    foodPreferences: {
        preferredCuisines: {
            type: [String],
            default: ['Pakistani']
        },
        spiceLevelPreference: {
            type: String,
            enum: ['mild', 'medium', 'hot', 'very_hot'],
            default: 'medium'
        },
        dietaryRestrictions: {
            type: [String],
            enum: ['vegetarian', 'vegan', 'halal', 'gluten-free', 'dairy-free'],
            default: ['halal']
        },
        allergies: {
            type: [String],
            default: []
        },
        favoriteCategories: {
            type: [String],
            default: []
        },
        avgRating: {
            type: Number,
            default: 0
        },
        totalInteractions: {
            type: Number,
            default: 0
        }
    }
});

// Check if the model already exists before defining it
const UserModel = mongoose.models.users || mongoose.model('users', userSchema);

module.exports = UserModel;
