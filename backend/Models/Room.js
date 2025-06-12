// Models/Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  roomType: {
    type: String,
    required: true,
    enum: ['Single', 'Double', 'Twin', 'Suite', 'Deluxe', 'Family', 'Presidential']
  },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    required: true,
    default: 'Available',
    enum: ['Available', 'Occupied', 'Maintenance', 'Reserved']
  },
  image: { type: String, required: false }, // Image path (optional)

  // Recommendation system fields
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0, min: 0 },
  popularityScore: { type: Number, default: 0 },

  // Room features for content-based recommendations
  capacity: { type: Number, required: true, min: 1, max: 10 },
  amenities: [{
    type: String,
    enum: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony', 'Sea View', 'City View',
           'Room Service', 'Jacuzzi', 'Kitchen', 'Workspace', 'Parking']
  }],
  floor: { type: Number, min: 1 },
  size: { type: Number }, // Room size in square feet
  bedType: {
    type: String,
    enum: ['Single', 'Double', 'Queen', 'King', 'Twin', 'Sofa Bed']
  },
  smokingAllowed: { type: Boolean, default: false },
  petFriendly: { type: Boolean, default: false },

  // Booking statistics
  totalBookings: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  lastBookedDate: { type: Date },

  // Maintenance and availability
  lastMaintenanceDate: { type: Date },
  nextMaintenanceDate: { type: Date },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Indexes for better query performance
roomSchema.index({ roomNumber: 1 });
roomSchema.index({ roomType: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ price: 1 });
roomSchema.index({ averageRating: -1 });
roomSchema.index({ popularityScore: -1 });
roomSchema.index({ capacity: 1 });

// Virtual for price category
roomSchema.virtual('priceCategory').get(function() {
  if (this.price <= 5000) return 'Budget';
  if (this.price <= 10000) return 'Standard';
  if (this.price <= 20000) return 'Premium';
  return 'Luxury';
});

// Virtual for occupancy rate (would need booking data)
roomSchema.virtual('occupancyRate').get(function() {
  // This would be calculated based on booking history
  // For now, return a placeholder
  return 0;
});

// Static method to get available rooms for date range
roomSchema.statics.getAvailableRooms = function(checkInDate, checkOutDate) {
  // This would integrate with the booking system
  return this.find({ status: 'Available', isActive: true });
};

// Static method to get rooms by price range
roomSchema.statics.getRoomsByPriceRange = function(minPrice, maxPrice) {
  return this.find({
    price: { $gte: minPrice, $lte: maxPrice },
    status: 'Available',
    isActive: true
  }).sort({ averageRating: -1, price: 1 });
};

// Instance method to update rating
roomSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.averageRating * this.totalRatings;
  this.totalRatings += 1;
  this.averageRating = (currentTotal + newRating) / this.totalRatings;
  this.popularityScore = this.averageRating * Math.log(this.totalRatings + 1);
  return this.save();
};

// Instance method to record booking
roomSchema.methods.recordBooking = function(bookingAmount) {
  this.totalBookings += 1;
  this.totalRevenue += bookingAmount;
  this.lastBookedDate = new Date();
  return this.save();
};

// Pre-save middleware to calculate popularity score
roomSchema.pre('save', function(next) {
  if (this.isModified('averageRating') || this.isModified('totalRatings')) {
    this.popularityScore = this.averageRating * Math.log(this.totalRatings + 1);
  }
  next();
});

// Check if the model already exists to prevent recompilation
const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);

module.exports = Room;
