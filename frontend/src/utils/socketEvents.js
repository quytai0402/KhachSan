/**
 * Socket.io event constants for the hotel management system frontend
 * Make sure to keep these in sync with the backend constants
 */

// Room events
export const ROOM_UPDATED = 'room-updated';
export const ROOM_CREATED = 'room-created';
export const ROOM_DELETED = 'room-deleted';
export const ROOM_STATUS_CHANGED = 'room-status-changed';

// Booking events
export const BOOKING_CREATED = 'booking-created';
export const BOOKING_UPDATED = 'booking-updated';
export const BOOKING_CANCELED = 'booking-canceled';
export const BOOKING_CHECKED_IN = 'booking-checked-in';
export const BOOKING_CHECKED_OUT = 'booking-checked-out';

// Service events
export const SERVICE_REQUESTED = 'service-requested';
export const SERVICE_UPDATED = 'service-updated';
export const SERVICE_COMPLETED = 'service-completed';

// User events
export const USER_UPDATED = 'user-updated';
export const STAFF_UPDATED = 'staff-updated';

// Activity tracking for roles
export const USER_ACTIVITY = 'USER_ACTIVITY';
export const STAFF_ACTIVITY = 'STAFF_ACTIVITY';
export const ADMIN_ACTIVITY = 'ADMIN_ACTIVITY';

// System events
export const SYSTEM_ALERT = 'system-alert';

// Notification events
export const NOTIFICATION = 'notification';
export const GLOBAL_NOTIFICATION = 'global-notification';

// Role-specific notifications
export const ADMIN_NOTIFICATION = 'admin-notification';
export const STAFF_NOTIFICATION = 'staff-notification';
export const USER_NOTIFICATION = 'user-notification'; 