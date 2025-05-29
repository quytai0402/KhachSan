/**
 * Socket.io event constants for the hotel management system
 */
const { SOCKET_EVENTS, USER_ROLES } = require('../constants');

// Use constants from central file
const {
  BOOKING_CREATED,
  BOOKING_UPDATED,
  BOOKING_CANCELLED,
  ROOM_STATUS_CHANGED,
  TASK_ASSIGNED,
  TASK_UPDATED,
  NOTIFICATION
} = SOCKET_EVENTS;

// Additional events for completeness
const ROOM_UPDATED = 'room-updated';
const ROOM_CREATED = 'room-created';
const ROOM_DELETED = 'room-deleted';
const BOOKING_CHECKED_IN = 'booking-checked-in';
const BOOKING_CHECKED_OUT = 'booking-checked-out';
const SERVICE_REQUESTED = 'service-requested';
const SERVICE_UPDATED = 'service-updated';
const SERVICE_COMPLETED = 'service-completed';
const USER_UPDATED = 'user-updated';
const STAFF_UPDATED = 'staff-updated';
const GLOBAL_NOTIFICATION = 'global-notification';

// Emit to all users with specific roles
const emitToRoles = (io, event, data, roles = [USER_ROLES.ADMIN, USER_ROLES.STAFF]) => {
  roles.forEach(role => {
    io.to(role).emit(event, data);
  });
};

// Emit to specific user
const emitToUser = (io, userId, event, data) => {
  io.to(`user-${userId}`).emit(event, data);
};

// Emit to all admins
const emitToAdmins = (io, event, data) => {
  emitToRoles(io, event, data, [USER_ROLES.ADMIN]);
};

// Emit to all staff
const emitToStaff = (io, event, data) => {
  emitToRoles(io, event, data, [USER_ROLES.STAFF]);
};

// Emit to admins and staff
const emitToAdminAndStaff = (io, event, data) => {
  emitToRoles(io, event, data, [USER_ROLES.ADMIN, USER_ROLES.STAFF]);
};

module.exports = {
  // Core events from constants
  BOOKING_CREATED,
  BOOKING_UPDATED,
  BOOKING_CANCELLED,
  ROOM_STATUS_CHANGED,
  TASK_ASSIGNED,
  TASK_UPDATED,
  NOTIFICATION,
  
  // Additional events
  ROOM_UPDATED,
  ROOM_CREATED,
  ROOM_DELETED,
  BOOKING_CHECKED_IN,
  BOOKING_CHECKED_OUT,
  SERVICE_REQUESTED,
  SERVICE_UPDATED,
  SERVICE_COMPLETED,
  USER_UPDATED,
  STAFF_UPDATED,
  GLOBAL_NOTIFICATION,
  
  // Utility functions
  emitToRoles,
  emitToUser,
  emitToAdmins,
  emitToStaff,
  emitToAdminAndStaff
}; 