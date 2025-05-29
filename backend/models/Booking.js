const mongoose = require('mongoose');
const { BOOKING_STATUS, PAYMENT_STATUS } = require('../constants');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.isGuestBooking; }
  },
  // Fields for guest bookings (non-registered users)
  isGuestBooking: {
    type: Boolean,
    default: false
  },
  guestName: {
    type: String,
    required: function() { return this.isGuestBooking; }
  },
  guestEmail: {
    type: String,
    required: function() { return this.isGuestBooking; }
  },
  guestPhone: {
    type: String,
    required: function() { return this.isGuestBooking; },
    index: true  // Add index for faster queries by phone number
  },
  guestAddress: {
    type: String
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  numberOfGuests: {
    adults: {
      type: Number,
      required: true,
      default: 1
    },
    children: {
      type: Number,
      default: 0
    }
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(BOOKING_STATUS),
    default: BOOKING_STATUS.PENDING
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING
  },
  specialRequests: {
    type: String
  },
  // Additional tracking fields
  roomNumber: {
    type: String
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  checkedInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  checkedOutBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
BookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);