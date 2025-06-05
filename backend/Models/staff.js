const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['manager', 'chef', 'waiter', 'host', 'admin'],
    default: 'waiter'
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['kitchen', 'service', 'management', 'front-desk'],
    default: 'service'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-leave'],
    default: 'active'
  },
  avatar: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
staffSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Staff', staffSchema);
