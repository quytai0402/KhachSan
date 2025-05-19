const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { ROLES } = require('../utils/roles');
const Task = require('../models/Task');
const User = require('../models/User');
const Room = require('../models/Room');

/**
 * @route   GET api/tasks
 * @desc    Get all tasks
 * @access  Private (Admin, Staff)
 */
router.get('/', auth, async (req, res) => {
  try {
    // Verify user role after authentication
    if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.STAFF) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Allow filtering by different fields
    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.taskType) {
      filter.taskType = req.query.taskType;
    }
    
    if (req.query.roomNumber) {
      filter.roomNumber = req.query.roomNumber;
    }
    
    // Staff can only see tasks assigned to them or unassigned tasks
    if (req.user.role === ROLES.STAFF) {
      filter.$or = [
        { assignedTo: req.user.id },
        { assignedTo: null }
      ];
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name')
      .populate('room', 'roomNumber')
      .sort({ priority: 1, createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi máy chủ');
  }
});

/**
 * @route   POST api/tasks
 * @desc    Create a new task
 * @access  Private (Admin, Staff)
 */
router.post('/', auth, async (req, res) => {
  try {
    // Verify user role after authentication
    if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.STAFF) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { roomNumber, taskType, priority, notes, assignedTo, estimatedTime } = req.body;

    // Find the room by room number
    const room = await Room.findOne({ roomNumber });
    
    if (!room) {
      return res.status(404).json({ msg: 'Không tìm thấy phòng' });
    }

    let assignedUser = null;
    if (assignedTo) {
      assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(404).json({ msg: 'Không tìm thấy nhân viên' });
      }
    }

    const newTask = new Task({
      roomNumber,
      taskType,
      priority: priority || 'medium',
      notes,
      assignedTo: assignedUser ? assignedUser._id : null,
      createdBy: req.user.id,
      room: room._id,
      estimatedTime: estimatedTime || null,
      status: assignedUser ? 'in-progress' : 'pending'
    });

    const task = await newTask.save();

    // If it's a cleaning task, update the room cleaning status
    if (taskType === 'cleaning') {
      room.cleaningStatus = 'dirty';
      await room.save();
    }

    // Populate user data for response
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name')
      .populate('room', 'roomNumber');

    res.json(populatedTask);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi máy chủ');
  }
});

/**
 * @route   PUT api/tasks/:id
 * @desc    Update a task
 * @access  Private (Admin, Staff)
 */
router.put('/:id', auth, async (req, res) => {
  try {
    // Verify user role after authentication
    if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.STAFF) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { status, assignedTo, notes } = req.body;

    // Find the task by ID
    let task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ msg: 'Không tìm thấy nhiệm vụ' });
    }

    // Check if user has permission to update this task
    if (req.user.role === ROLES.STAFF && task.assignedTo && 
        task.assignedTo.toString() !== req.user.id && 
        task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Không có quyền cập nhật nhiệm vụ này' });
    }

    // Update task fields
    if (status) task.status = status;
    if (notes) task.notes = notes;
    
    // If status changed to completed, update completedAt
    if (status === 'completed' && task.status !== 'completed') {
      task.completedAt = Date.now();
      
      // If it's a cleaning task, update the room cleaning status
      if (task.taskType === 'cleaning') {
        const room = await Room.findById(task.room);
        room.cleaningStatus = 'clean';
        await room.save();
      }
    }
    
    // Handle assignment update
    if (assignedTo !== undefined) {
      if (assignedTo) {
        const user = await User.findById(assignedTo);
        if (!user) {
          return res.status(404).json({ msg: 'Không tìm thấy nhân viên' });
        }
        task.assignedTo = user._id;
        
        // If assigned for the first time, change status to in-progress
        if (!task.assignedTo && task.status === 'pending') {
          task.status = 'in-progress';
        }
      } else {
        task.assignedTo = null;
      }
    }

    await task.save();

    // Populate user data for response
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name')
      .populate('room', 'roomNumber');

    res.json(populatedTask);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi máy chủ');
  }
});

/**
 * @route   DELETE api/tasks/:id
 * @desc    Delete a task
 * @access  Private (Admin)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    // Verify user is admin
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ msg: 'Không tìm thấy nhiệm vụ' });
    }

    await task.remove();
    res.json({ msg: 'Đã xóa nhiệm vụ' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi máy chủ');
  }
});

/**
 * @route   GET api/tasks/stats
 * @desc    Get tasks statistics
 * @access  Private (Admin, Staff)
 */
router.get('/stats', auth, async (req, res) => {
  try {
    // Verify user role after authentication
    if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.STAFF) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const stats = {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      cleaning: 0,
      maintenance: 0,
      service: 0,
      highPriority: 0,
      assignedToMe: 0
    };

    // Base filter (different for admin vs staff)
    const filter = req.user.role === ROLES.STAFF 
      ? { $or: [{ assignedTo: req.user.id }, { assignedTo: null }] }
      : {};
    
    const tasks = await Task.find(filter);
    
    stats.total = tasks.length;
    
    // Count by status
    stats.pending = tasks.filter(task => task.status === 'pending').length;
    stats.inProgress = tasks.filter(task => task.status === 'in-progress').length;
    stats.completed = tasks.filter(task => task.status === 'completed').length;
    
    // Count by type
    stats.cleaning = tasks.filter(task => task.taskType === 'cleaning').length;
    stats.maintenance = tasks.filter(task => task.taskType === 'maintenance').length;
    stats.service = tasks.filter(task => task.taskType === 'service').length;
    
    // High priority tasks
    stats.highPriority = tasks.filter(task => task.priority === 'high').length;
    
    // Assigned to current user
    stats.assignedToMe = tasks.filter(task => 
      task.assignedTo && task.assignedTo.toString() === req.user.id
    ).length;

    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi máy chủ');
  }
});

module.exports = router;
