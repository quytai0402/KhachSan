const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: true
  },
  discountPercent: {
    type: Number,
    default: function() {
      return this.discountType === 'percentage' ? this.discountValue : 0;
    }
  },
  validFrom: {
    type: Date,
    required: true
  },
  validTo: {
    type: Date,
    required: true
  },
  image: {
    type: String
  },
  title: {
    type: String,
    default: function() {
      return this.name;
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableRoomTypes: [{
    type: String,
    enum: ['single', 'double', 'twin', 'suite', 'family', 'deluxe', 'all']
  }],
  minimumStay: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Promotion', PromotionSchema); 