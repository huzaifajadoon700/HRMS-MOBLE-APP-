// /models/tableModel.js
const mongoose = require('mongoose');

// Check if the model already exists to prevent recompilation
const Table = mongoose.models.Table || mongoose.model('Table', new mongoose.Schema({
  tableName: { 
    type: String, 
    required: true,
    trim: true
  },
  tableType: { 
    type: String, 
    required: true,
    enum: ['indoor', 'outdoor', 'private']
  },
  capacity: { 
    type: Number, 
    required: true,
    min: 1
  },
  status: { 
    type: String, 
    required: true,
    enum: ['Available', 'Booked', 'Reserved'],
    default: 'Available'
  },
  image: { 
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false,
    trim: true
  }
}, {
  timestamps: true
}));

// Add index for faster queries if not already added
if (!Table.schema.path('tableName')._index) {
  Table.schema.index({ tableName: 1 });
}
if (!Table.schema.path('status')._index) {
  Table.schema.index({ status: 1 });
}

module.exports = Table;
