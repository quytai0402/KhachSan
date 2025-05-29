// Hotel Management System Constants

// User Roles
const USER_ROLES = {
  USER: 'user',
  STAFF: 'staff',
  ADMIN: 'admin'
};

// Room Status
const ROOM_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  CLEANING: 'cleaning',
  VACANT_CLEAN: 'vacant-clean',
  VACANT_DIRTY: 'vacant-dirty'
};

// Cleaning Status
const CLEANING_STATUS = {
  CLEAN: 'clean',
  DIRTY: 'dirty',
  CLEANING: 'cleaning'
};

// Booking Status
const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked-in',
  CHECKED_OUT: 'checked-out',
  CANCELLED: 'cancelled'
};

// Payment Status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded'
};

// Task Status
const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
};

// Task Types
const TASK_TYPES = {
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance',
  SERVICE: 'service'
};

// Task Priority
const TASK_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Service Categories
const SERVICE_CATEGORIES = {
  RESTAURANT: 'restaurant',
  SPA: 'spa',
  GYM: 'gym',
  POOL: 'pool',
  TRANSPORT: 'transport',
  LAUNDRY: 'laundry',
  OTHER: 'other'
};

// Service Status
const SERVICE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Room Types (Vietnamese names)
const ROOM_TYPES = {
  STANDARD: 'Standard',
  DELUXE: 'Deluxe',
  SUITE: 'Suite',
  FAMILY: 'Family'
};

// Common Amenities (Vietnamese)
const COMMON_AMENITIES = [
  'Wi-Fi',
  'Điều hòa',
  'TV màn hình phẳng',
  'Phòng tắm riêng',
  'Minibar',
  'Máy pha cà phê',
  'Két sắt',
  'Máy sấy tóc',
  'Bàn là',
  'Bàn làm việc',
  'Tủ quần áo',
  'Dịch vụ phòng',
  'Ban công',
  'Tủ lạnh',
  'Máy lạnh'
];

// Email Templates
const EMAIL_TEMPLATES = {
  BOOKING_CONFIRMATION: 'booking_confirmation',
  BOOKING_CANCELLATION: 'booking_cancellation',
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset'
};

// Notification Types
const NOTIFICATION_TYPES = {
  BOOKING: 'booking',
  ROOM: 'room',
  TASK: 'task',
  SYSTEM: 'system'
};

// Socket Events
const SOCKET_EVENTS = {
  BOOKING_CREATED: 'booking_created',
  BOOKING_UPDATED: 'booking_updated',
  BOOKING_CANCELLED: 'booking_cancelled',
  ROOM_STATUS_CHANGED: 'room_status_changed',
  TASK_ASSIGNED: 'task_assigned',
  TASK_UPDATED: 'task_updated',
  NOTIFICATION: 'notification'
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// Validation Rules
const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ROOM_NUMBER_MIN: 1,
  ROOM_NUMBER_MAX: 999,
  FLOOR_MIN: 1,
  FLOOR_MAX: 50,
  CAPACITY_MIN: 1,
  CAPACITY_MAX: 10,
  PRICE_MIN: 100000, // 100k VND
  PRICE_MAX: 10000000, // 10M VND
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_ROOM: 5
};

// Error Messages
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Not authorized',
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_NOT_FOUND: 'User not found',
  USER_EXISTS: 'User already exists',
  ROOM_NOT_FOUND: 'Room not found',
  BOOKING_NOT_FOUND: 'Booking not found',
  INVALID_INPUT: 'Invalid input provided',
  INVALID_EMAIL: 'Invalid email format',
  SERVER_ERROR: 'Internal server error'
};

// Date Formats
const DATE_FORMATS = {
  API: 'YYYY-MM-DD',
  DISPLAY: 'DD/MM/YYYY',
  DATETIME: 'DD/MM/YYYY HH:mm',
  TIME: 'HH:mm'
};

module.exports = {
  USER_ROLES,
  ROOM_STATUS,
  CLEANING_STATUS,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  TASK_STATUS,
  TASK_TYPES,
  TASK_PRIORITY,
  SERVICE_CATEGORIES,
  SERVICE_STATUS,
  ROOM_TYPES,
  COMMON_AMENITIES,
  EMAIL_TEMPLATES,
  NOTIFICATION_TYPES,
  SOCKET_EVENTS,
  HTTP_STATUS,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  DATE_FORMATS
};
