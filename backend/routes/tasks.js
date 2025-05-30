const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { 
  USER_ROLES, 
  TASK_STATUS, 
  TASK_TYPES, 
  TASK_PRIORITY, 
  CLEANING_STATUS,
  HTTP_STATUS, 
  ERROR_MESSAGES 
} = require('../constants');
const Task = require('../models/Task');
const User = require('../models/User');
const Room = require('../models/Room');

/**
 * @route   GET api/tasks
 * @desc    Get all tasks
 * @access  Private (Admin, Staff)
 */
router.get('/', auth, asyncHandler(async (req, res) => {
  // Verify user role after authentication
  if (req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.STAFF) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ 
      message: ERROR_MESSAGES.UNAUTHORIZED 
    });
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
  if (req.user.role === USER_ROLES.STAFF) {
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

  res.status(HTTP_STATUS.OK).json(tasks);
}));

/**
 * @route   POST api/tasks
 * @desc    Create a new task
 * @access  Private (Admin, Staff)
 */
router.post('/', auth, asyncHandler(async (req, res) => {
  // Verify user role after authentication
  if (req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.STAFF) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ 
      message: ERROR_MESSAGES.UNAUTHORIZED 
    });
  }
  
  const { roomNumber, taskType, priority, notes, assignedTo, estimatedTime } = req.body;

  // Find the room by room number
  const room = await Room.findOne({ roomNumber });
  
  if (!room) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ 
      message: 'Room not found' 
    });
  }

  let assignedUser = null;
  if (assignedTo) {
    assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ 
        message: 'Staff member not found' 
      });
    }
  }

  const newTask = new Task({
    roomNumber,
    taskType,
    priority: priority || TASK_PRIORITY.MEDIUM,
    notes,
    assignedTo: assignedUser ? assignedUser._id : null,
    createdBy: req.user.id,
    room: room._id,
    estimatedTime: estimatedTime || null,
    status: assignedUser ? TASK_STATUS.IN_PROGRESS : TASK_STATUS.PENDING
  });

  const task = await newTask.save();

  // If it's a cleaning task, update the room cleaning status
  if (taskType === TASK_TYPES.CLEANING) {
    room.cleaningStatus = CLEANING_STATUS.DIRTY;
    await room.save();
  }

  // Populate user data for response
  const populatedTask = await Task.findById(task._id)
    .populate('assignedTo', 'name')
    .populate('createdBy', 'name')
    .populate('room', 'roomNumber');

  res.status(HTTP_STATUS.CREATED).json(populatedTask);
}));

/**
 * @route   PUT api/tasks/:id
 * @desc    Update a task
 * @access  Private (Admin, Staff)
 */
router.put('/:id', auth, asyncHandler(async (req, res) => {
  // Verify user role after authentication
  if (req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.STAFF) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ 
      message: ERROR_MESSAGES.UNAUTHORIZED 
    });
  }
  
  const { status, assignedTo, notes } = req.body;

  // Find the task by ID
  let task = await Task.findById(req.params.id);
  
  if (!task) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ 
      message: 'Task not found' 
    });
  }

  // Check if user has permission to update this task
  if (req.user.role === USER_ROLES.STAFF && task.assignedTo && 
      task.assignedTo.toString() !== req.user.id && 
      task.createdBy.toString() !== req.user.id) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ 
      message: 'Not authorized to update this task' 
    });
  }

  // Update task fields
  if (status) task.status = status;
  if (notes) task.notes = notes;
  
  // If status changed to completed, update completedAt
  if (status === TASK_STATUS.COMPLETED && task.status !== TASK_STATUS.COMPLETED) {
    task.completedAt = Date.now();
    
    // If it's a cleaning task, update the room cleaning status
    if (task.taskType === TASK_TYPES.CLEANING) {
      const room = await Room.findById(task.room);
      room.cleaningStatus = CLEANING_STATUS.CLEAN;
      await room.save();
    }
  }
  
  // Handle assignment update
  if (assignedTo !== undefined) {
    if (assignedTo) {
      const user = await User.findById(assignedTo);
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ 
          message: 'Staff member not found' 
        });
      }
      task.assignedTo = user._id;
      
      // If assigned for the first time, change status to in-progress
      if (!task.assignedTo && task.status === TASK_STATUS.PENDING) {
        task.status = TASK_STATUS.IN_PROGRESS;
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

  res.status(HTTP_STATUS.OK).json(populatedTask);
}));

/**
 * @route   DELETE api/tasks/:id
 * @desc    Delete a task
 * @access  Private (Admin)
 */
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  // Verify user is admin
  if (req.user.role !== USER_ROLES.ADMIN) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ 
      message: ERROR_MESSAGES.UNAUTHORIZED 
    });
  }
  
  const task = await Task.findById(req.params.id);
  
  if (!task) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ 
      message: 'Task not found' 
    });
  }

  await Task.findByIdAndDelete(req.params.id);
  res.status(HTTP_STATUS.OK).json({ 
    message: 'Task deleted successfully' 
  });
}));

/**
 * @route   GET api/tasks/stats
 * @desc    Get tasks statistics
 * @access  Private (Admin, Staff)
 */
router.get('/stats', auth, asyncHandler(async (req, res) => {
  // Verify user role after authentication
  if (req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.STAFF) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ 
      message: ERROR_MESSAGES.UNAUTHORIZED 
    });
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
  const filter = req.user.role === USER_ROLES.STAFF 
    ? { $or: [{ assignedTo: req.user.id }, { assignedTo: null }] }
    : {};
  
  const tasks = await Task.find(filter);
  
  stats.total = tasks.length;
  
  // Count by status
  stats.pending = tasks.filter(task => task.status === TASK_STATUS.PENDING).length;
  stats.inProgress = tasks.filter(task => task.status === TASK_STATUS.IN_PROGRESS).length;
  stats.completed = tasks.filter(task => task.status === TASK_STATUS.COMPLETED).length;
  
  // Count by type
  stats.cleaning = tasks.filter(task => task.taskType === TASK_TYPES.CLEANING).length;
  stats.maintenance = tasks.filter(task => task.taskType === TASK_TYPES.MAINTENANCE).length;
  stats.service = tasks.filter(task => task.taskType === TASK_TYPES.SERVICE).length;
  
  // High priority tasks
  stats.highPriority = tasks.filter(task => task.priority === TASK_PRIORITY.HIGH).length;
  
  // Assigned to current user
  stats.assignedToMe = tasks.filter(task => 
    task.assignedTo && task.assignedTo.toString() === req.user.id
  ).length;

  res.status(HTTP_STATUS.OK).json(stats);
}));

/**
 * @route   POST api/tasks
 * @desc    Create a new task
 * @access  Private (Admin, Staff)
 */
router.post('/', auth, asyncHandler(async (req, res) => {
  // Verify user role
  if (req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.STAFF) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ 
      message: ERROR_MESSAGES.UNAUTHORIZED 
    });
  }
  
  const { title, description, type, priority, assignedTo, room, dueDate } = req.body;
  
  // Validate required fields
  if (!title || !type) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: 'Title and type are required fields'
    });
  }
  
  // Validate task type
  const validTypes = Object.values(TASK_TYPES);
  if (!validTypes.includes(type)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: `Invalid task type. Must be one of: ${validTypes.join(', ')}`
    });
  }
  
  // Validate priority if provided
  if (priority) {
    const validPriorities = Object.values(TASK_PRIORITY);
    if (!validPriorities.includes(priority)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`
      });
    }
  }
  
  // Validate assignedTo user exists if provided
  if (assignedTo) {
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Assigned user not found'
      });
    }
    
    // Check if assigned user is staff or admin
    if (assignedUser.role !== USER_ROLES.STAFF && assignedUser.role !== USER_ROLES.ADMIN) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Tasks can only be assigned to staff or admin users'
      });
    }
  }
  
  // Validate room exists if provided
  if (room) {
    const roomExists = await Room.findById(room);
    if (!roomExists) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Room not found'
      });
    }
  }
  
  const newTask = new Task({
    title,
    description,
    type,
    priority: priority || TASK_PRIORITY.NORMAL,
    assignedTo,
    room,
    dueDate: dueDate ? new Date(dueDate) : null,
    createdBy: req.user.id,
    status: TASK_STATUS.PENDING
  });
  
  await newTask.save();
  
  // Populate the created task for response
  const populatedTask = await Task.findById(newTask._id)
    .populate('assignedTo', 'name email role')
    .populate('room', 'roomNumber type')
    .populate('createdBy', 'name email');
  
  res.status(HTTP_STATUS.CREATED).json({ 
    success: true, 
    data: populatedTask,
    message: 'Task created successfully' 
  });
}));

/**
 * @route   PUT api/tasks/:id
 * @desc    Update a task
 * @access  Private (Admin, Staff)
 */
router.put('/:id', auth, asyncHandler(async (req, res) => {
  if (req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.STAFF) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ 
      message: ERROR_MESSAGES.UNAUTHORIZED 
    });
  }
  
  const task = await Task.findById(req.params.id);
  
  if (!task) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ 
      message: 'Task not found' 
    });
  }
  
  // Check if user can update this task
  // Staff can only update tasks assigned to them or unassigned tasks
  if (req.user.role === USER_ROLES.STAFF) {
    if (task.assignedTo && task.assignedTo.toString() !== req.user.id) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: 'You can only update tasks assigned to you'
      });
    }
  }
  
  const { title, description, type, priority, assignedTo, room, dueDate, status, notes } = req.body;
  
  // Validate task type if provided
  if (type) {
    const validTypes = Object.values(TASK_TYPES);
    if (!validTypes.includes(type)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: `Invalid task type. Must be one of: ${validTypes.join(', ')}`
      });
    }
  }
  
  // Validate priority if provided
  if (priority) {
    const validPriorities = Object.values(TASK_PRIORITY);
    if (!validPriorities.includes(priority)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`
      });
    }
  }
  
  // Validate status if provided
  if (status) {
    const validStatuses = Object.values(TASK_STATUS);
    if (!validStatuses.includes(status)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
  }
  
  // Validate assignedTo user if provided
  if (assignedTo) {
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Assigned user not found'
      });
    }
    
    if (assignedUser.role !== USER_ROLES.STAFF && assignedUser.role !== USER_ROLES.ADMIN) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Tasks can only be assigned to staff or admin users'
      });
    }
  }
  
  // Validate room if provided
  if (room) {
    const roomExists = await Room.findById(room);
    if (!roomExists) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Room not found'
      });
    }
  }
  
  // Build update object
  const updateData = {};
  if (title) updateData.title = title;
  if (description) updateData.description = description;
  if (type) updateData.type = type;
  if (priority) updateData.priority = priority;
  if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
  if (room !== undefined) updateData.room = room;
  if (dueDate) updateData.dueDate = new Date(dueDate);
  if (status) updateData.status = status;
  if (notes) updateData.notes = notes;
  
  // Set completion time if status is completed
  if (status === TASK_STATUS.COMPLETED) {
    updateData.completedAt = new Date();
    updateData.completedBy = req.user.id;
  }
  
  updateData.updatedAt = new Date();
  
  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  ).populate('assignedTo', 'name email role')
   .populate('room', 'roomNumber type')
   .populate('createdBy', 'name email')
   .populate('completedBy', 'name email');
  
  res.json({ 
    success: true, 
    data: updatedTask,
    message: 'Task updated successfully' 
  });
}));

/**
 * @route   DELETE api/tasks/:id
 * @desc    Delete a task
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  if (req.user.role !== USER_ROLES.ADMIN) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ 
      message: 'Only admins can delete tasks' 
    });
  }
  
  const task = await Task.findById(req.params.id);
  
  if (!task) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ 
      message: 'Task not found' 
    });
  }
  
  await Task.findByIdAndDelete(req.params.id);
  
  res.json({ 
    success: true, 
    message: 'Task deleted successfully' 
  });
}));

module.exports = router;
