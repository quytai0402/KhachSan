const mongoose = require('mongoose');
const { TASK_TYPES, TASK_PRIORITY, TASK_STATUS } = require('../constants');

const TaskSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true
  },
  taskType: {
    type: String,
    enum: Object.values(TASK_TYPES),
    required: true
  },
  priority: {
    type: String,
    enum: Object.values(TASK_PRIORITY),
    default: TASK_PRIORITY.MEDIUM
  },
  status: {
    type: String,
    enum: Object.values(TASK_STATUS),
    default: TASK_STATUS.PENDING
  },
  notes: {
    type: String,
    default: ''
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  estimatedTime: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Task', TaskSchema);
