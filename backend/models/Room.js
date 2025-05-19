const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoomType',
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
  capacity: {
    type: Number,
    required: true,
    default: 1
  },
  amenities: [{
    type: String
  }],
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['available', 'booked', 'maintenance', 'cleaning', 'occupied', 'vacant-clean', 'vacant-dirty'],
    default: 'available'
  },
  cleaningStatus: {
    type: String,
    enum: ['clean', 'dirty', 'cleaning'],
    default: 'clean'
  },
  floor: {
    type: Number
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Room', RoomSchema); 