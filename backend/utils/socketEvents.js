/**
 * Socket.io event constants for the hotel management system
 */

// Room events
const ROOM_UPDATED = 'room-updated';
const ROOM_CREATED = 'room-created';
const ROOM_DELETED = 'room-deleted';
const ROOM_STATUS_CHANGED = 'room-status-changed';

// Booking events
const BOOKING_CREATED = 'booking-created';
const BOOKING_UPDATED = 'booking-updated';
const BOOKING_CANCELED = 'booking-canceled';
const BOOKING_CHECKED_IN = 'booking-checked-in';
const BOOKING_CHECKED_OUT = 'booking-checked-out';

// Service events
const SERVICE_REQUESTED = 'service-requested';
const SERVICE_UPDATED = 'service-updated';
const SERVICE_COMPLETED = 'service-completed';

// User events
const USER_UPDATED = 'user-updated';
const STAFF_UPDATED = 'staff-updated';

// Notification events
const NOTIFICATION = 'notification';
const GLOBAL_NOTIFICATION = 'global-notification';

module.exports = {
  // Room events
  ROOM_UPDATED,
  ROOM_CREATED,
  ROOM_DELETED,
  ROOM_STATUS_CHANGED,
  
  // Booking events
  BOOKING_CREATED,
  BOOKING_UPDATED,
  BOOKING_CANCELED,
  BOOKING_CHECKED_IN,
  BOOKING_CHECKED_OUT,
  
  // Service events
  SERVICE_REQUESTED,
  SERVICE_UPDATED,
  SERVICE_COMPLETED,
  
  // User events
  USER_UPDATED,
  STAFF_UPDATED,
  
  // Notification events
  NOTIFICATION,
  GLOBAL_NOTIFICATION,
  
  // Utility function to emit to specific roles
  emitToRoles: (io, event, data, roles = ['admin', 'staff']) => {
    roles.forEach(role => {
      io.to(role).emit(event, data);
    });
  },
  
  // Utility function to emit to a specific user
  emitToUser: (io, userId, event, data) => {
    io.to(`user-${userId}`).emit(event, data);
  }
}; 