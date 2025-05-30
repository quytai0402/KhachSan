const mongoose = require('mongoose');
const { SERVICE_STATUS } = require('../constants');

const GuestRequestSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['room_service', 'housekeeping', 'maintenance', 'concierge', 'laundry', 'other'],
    default: 'room_service'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: Object.values(SERVICE_STATUS),
    default: SERVICE_STATUS.PENDING
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  guestName: {
    type: String,
    required: true
  },
  guestPhone: {
    type: String
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  actualCost: {
    type: Number,
    default: 0
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  assignedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Update lastUpdated on save
GuestRequestSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('GuestRequest', GuestRequestSchema);
