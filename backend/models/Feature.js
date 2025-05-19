const mongoose = require('mongoose');

const FeatureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['room', 'spa', 'dining', 'roomservice', 'wifi', 'fitness', 'pool', 'other'],
    default: 'other'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feature', FeatureSchema); 