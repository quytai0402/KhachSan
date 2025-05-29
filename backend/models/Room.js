const mongoose = require('mongoose');
const { ROOM_STATUS, CLEANING_STATUS } = require('../constants');

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
    enum: Object.values(ROOM_STATUS),
    default: ROOM_STATUS.AVAILABLE
  },
  cleaningStatus: {
    type: String,
    enum: Object.values(CLEANING_STATUS),
    default: CLEANING_STATUS.CLEAN
  },
  floor: {
    type: Number
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);