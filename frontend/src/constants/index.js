// Frontend Constants - Hotel Management System

// User Roles
export const USER_ROLES = {
  USER: 'user',
  STAFF: 'staff',
  ADMIN: 'admin'
};

// Room Status
export const ROOM_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  CLEANING: 'cleaning',
  VACANT_CLEAN: 'vacant-clean',
  VACANT_DIRTY: 'vacant-dirty'
};

// Room Status Display (Vietnamese)
export const ROOM_STATUS_DISPLAY = {
  [ROOM_STATUS.AVAILABLE]: 'Có sẵn',
  [ROOM_STATUS.BOOKED]: 'Đã đặt',
  [ROOM_STATUS.OCCUPIED]: 'Đang sử dụng',
  [ROOM_STATUS.MAINTENANCE]: 'Bảo trì',
  [ROOM_STATUS.CLEANING]: 'Đang dọn dẹp',
  [ROOM_STATUS.VACANT_CLEAN]: 'Trống - Sạch',
  [ROOM_STATUS.VACANT_DIRTY]: 'Trống - Cần dọn'
};

// Room Status Colors for UI
export const ROOM_STATUS_COLORS = {
  [ROOM_STATUS.AVAILABLE]: 'success',
  [ROOM_STATUS.BOOKED]: 'warning',
  [ROOM_STATUS.OCCUPIED]: 'info',
  [ROOM_STATUS.MAINTENANCE]: 'error',
  [ROOM_STATUS.CLEANING]: 'warning',
  [ROOM_STATUS.VACANT_CLEAN]: 'success',
  [ROOM_STATUS.VACANT_DIRTY]: 'error'
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked-in',
  CHECKED_OUT: 'checked-out',
  CANCELLED: 'cancelled'
};

// Booking Status Display (Vietnamese)
export const BOOKING_STATUS_DISPLAY = {
  [BOOKING_STATUS.PENDING]: 'Chờ xử lý',
  [BOOKING_STATUS.CONFIRMED]: 'Đã xác nhận',
  [BOOKING_STATUS.CHECKED_IN]: 'Đã check-in',
  [BOOKING_STATUS.CHECKED_OUT]: 'Đã check-out',
  [BOOKING_STATUS.CANCELLED]: 'Đã hủy'
};

// Booking Status Colors
export const BOOKING_STATUS_COLORS = {
  [BOOKING_STATUS.PENDING]: 'warning',
  [BOOKING_STATUS.CONFIRMED]: 'info',
  [BOOKING_STATUS.CHECKED_IN]: 'success',
  [BOOKING_STATUS.CHECKED_OUT]: 'default',
  [BOOKING_STATUS.CANCELLED]: 'error'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded'
};

// Payment Status Display (Vietnamese)
export const PAYMENT_STATUS_DISPLAY = {
  [PAYMENT_STATUS.PENDING]: 'Chưa thanh toán',
  [PAYMENT_STATUS.PAID]: 'Đã thanh toán',
  [PAYMENT_STATUS.REFUNDED]: 'Đã hoàn tiền'
};

// Payment Status Colors
export const PAYMENT_STATUS_COLORS = {
  [PAYMENT_STATUS.PENDING]: 'warning',
  [PAYMENT_STATUS.PAID]: 'success',
  [PAYMENT_STATUS.REFUNDED]: 'info'
};

// Task Status
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
};

// Task Status Display (Vietnamese)
export const TASK_STATUS_DISPLAY = {
  [TASK_STATUS.PENDING]: 'Chờ xử lý',
  [TASK_STATUS.IN_PROGRESS]: 'Đang thực hiện',
  [TASK_STATUS.COMPLETED]: 'Hoàn thành'
};

// Task Types
export const TASK_TYPES = {
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance',
  SERVICE: 'service'
};

// Task Types Display (Vietnamese)
export const TASK_TYPES_DISPLAY = {
  [TASK_TYPES.CLEANING]: 'Dọn dẹp',
  [TASK_TYPES.MAINTENANCE]: 'Bảo trì',
  [TASK_TYPES.SERVICE]: 'Dịch vụ'
};

// Task Priority
export const TASK_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Task Priority Display (Vietnamese)
export const TASK_PRIORITY_DISPLAY = {
  [TASK_PRIORITY.HIGH]: 'Cao',
  [TASK_PRIORITY.MEDIUM]: 'Trung bình',
  [TASK_PRIORITY.LOW]: 'Thấp'
};

// Task Priority Colors
export const TASK_PRIORITY_COLORS = {
  [TASK_PRIORITY.HIGH]: 'error',
  [TASK_PRIORITY.MEDIUM]: 'warning',
  [TASK_PRIORITY.LOW]: 'info'
};

// Room Types (Vietnamese names)
export const ROOM_TYPES = {
  STANDARD: 'Standard',
  DELUXE: 'Deluxe',
  SUITE: 'Suite',
  FAMILY: 'Family'
};

// Room Types Display (Vietnamese)
export const ROOM_TYPES_DISPLAY = {
  [ROOM_TYPES.STANDARD]: 'Phòng Tiêu chuẩn',
  [ROOM_TYPES.DELUXE]: 'Phòng Deluxe',
  [ROOM_TYPES.SUITE]: 'Phòng Suite',
  [ROOM_TYPES.FAMILY]: 'Phòng Gia đình'
};

// Common Amenities (Vietnamese)
export const COMMON_AMENITIES = [
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

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/user',
    USER: '/auth/user',
    CHANGE_PASSWORD: '/auth/change-password'
  },
  ROOMS: {
    BASE: '/rooms',
    LIST: '/rooms',
    TYPES: '/rooms/types',
    FEATURED: '/rooms/featured',
    AVAILABLE: '/rooms/available',
    CREATE: '/rooms',
    UPDATE: '/rooms',
    DELETE: '/rooms'
  },
  BOOKINGS: {
    BASE: '/bookings',
    LIST: '/bookings',
    MY_BOOKINGS: '/bookings/me',
    USER: '/bookings/me',
    BY_ROOM: '/bookings/room',
    BY_PHONE: '/bookings/phone',
    CREATE: '/bookings',
    GUEST_CREATE: '/bookings/guest',
    GUEST: '/bookings/guest',
    UPDATE: '/bookings',
    STATUS: '/bookings',
    PAYMENT: '/bookings',
    CANCEL: '/bookings',
    DELETE: '/bookings'
  },
  USERS: {
    BASE: '/users',
    LIST: '/users',
    CREATE: '/users',
    ADMIN: '/users/admin',
    UPDATE: '/users',
    DELETE: '/users'
  },
  SERVICES: {
    BASE: '/services',
    LIST: '/services',
    FEATURES: '/services/features',
    CATEGORY: '/services/category',
    CREATE: '/services',
    UPDATE: '/services',
    DELETE: '/services'
  },
  PROMOTIONS: {
    BASE: '/promotions',
    LIST: '/promotions',
    CREATE: '/promotions',
    UPDATE: '/promotions',
    DELETE: '/promotions'
  },
  TASKS: {
    BASE: '/tasks',
    LIST: '/tasks',
    CREATE: '/tasks',
    UPDATE: '/tasks',
    DELETE: '/tasks'
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    REPORTS: '/admin/reports',
    ACTIVITIES: '/admin/activities'
  },
  STAFF: {
    DASHBOARD: '/staff/dashboard',
    SCHEDULE: '/staff/schedule',
    GUESTS: '/staff/guests',
    BOOKINGS: '/staff/bookings',
    ROOMS: '/staff/rooms',
    ACTIVITIES: '/staff/activities',
    SERVICES: '/staff/services'
  }
};

// Navigation Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  ROOMS: '/rooms',
  ROOM_DETAIL: '/rooms/:id',
  BOOKING: '/booking',
  MY_BOOKINGS: '/my-bookings',
  SERVICES: '/services',
  PROMOTIONS: '/promotions',
  CONTACT: '/contact',
  
  // Admin Routes
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    ROOMS: '/admin/rooms',
    BOOKINGS: '/admin/bookings',
    USERS: '/admin/users',
    SERVICES: '/admin/services',
    PROMOTIONS: '/admin/promotions',
    REPORTS: '/admin/reports',
    HOUSEKEEPING: '/admin/housekeeping'
  },
  
  // Staff Routes
  STAFF: {
    DASHBOARD: '/staff/dashboard',
    ROOMS: '/staff/rooms',
    BOOKINGS: '/staff/bookings',
    SCHEDULE: '/staff/schedule',
    GUESTS: '/staff/guests',
    HOUSEKEEPING: '/staff/housekeeping',
    PROMOTIONS: '/staff/promotions'
  }
};

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
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

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
};

// Date Formats
export const DATE_FORMATS = {
  API: 'YYYY-MM-DD',
  DISPLAY: 'DD/MM/YYYY',
  DATETIME: 'DD/MM/YYYY HH:mm',
  TIME: 'HH:mm'
};

// Default Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Socket Events
export const SOCKET_EVENTS = {
  BOOKING_CREATED: 'booking_created',
  BOOKING_UPDATED: 'booking_updated',
  BOOKING_CANCELLED: 'booking_cancelled',
  ROOM_STATUS_CHANGED: 'room_status_changed',
  TASK_ASSIGNED: 'task_assigned',
  TASK_UPDATED: 'task_updated',
  NOTIFICATION: 'notification'
};
