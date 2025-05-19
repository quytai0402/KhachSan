import { useSocket } from '../context/SocketContext';
import { useState, useCallback, useRef } from 'react';

/**
 * Predefined action types to ensure consistency across the application
 */
export const ACTION_TYPES = {
  // Room actions
  ROOM_CREATED: 'created a new room',
  ROOM_UPDATED: 'updated room information',
  ROOM_DELETED: 'deleted a room',
  ROOM_STATUS_CHANGED: 'changed room status',
  ROOM_MAINTENANCE: 'set room to maintenance',
  ROOM_CLEANED: 'marked room as cleaned',
  
  // Booking actions
  BOOKING_CREATED: 'created a new booking',
  BOOKING_UPDATED: 'updated booking information',
  BOOKING_CANCELED: 'canceled a booking',
  BOOKING_CHECKED_IN: 'checked in a guest',
  BOOKING_CHECKED_OUT: 'checked out a guest',
  BOOKING_ASSIGNED_ROOM: 'assigned a room to booking',
  
  // User actions
  USER_CREATED: 'created a new user account',
  USER_UPDATED: 'updated user information',
  USER_DELETED: 'deleted a user account',
  USER_ROLE_CHANGED: 'changed user role',
  
  // Service actions
  SERVICE_ADDED: 'added a new service',
  SERVICE_UPDATED: 'updated service information',
  SERVICE_DELETED: 'deleted a service',
  SERVICE_REQUESTED: 'requested a service',
  SERVICE_COMPLETED: 'completed a service request',
  
  // Staff actions
  STAFF_ASSIGNED: 'assigned a staff member',
  STAFF_SCHEDULE_UPDATED: 'updated staff schedule',
  
  // System actions
  SYSTEM_SETTINGS_UPDATED: 'updated system settings',
  PROMOTION_CREATED: 'created a new promotion',
  PROMOTION_UPDATED: 'updated a promotion',
  PROMOTION_DELETED: 'deleted a promotion'
};

// Rate limit duration for same action in milliseconds
const RATE_LIMIT_DURATION = 30000; // Increased from 5000 to 30000 (30 seconds)

// Keep track of activity view events specially to prevent refreshes
const viewEvents = {};

/**
 * Custom hook to track and broadcast user actions
 * @returns {Object} - Activity tracking functions
 */
export const useActivityTracker = () => {
  const { broadcastAction } = useSocket();
  // Store last tracked actions to avoid duplicates
  const [lastActions, setLastActions] = useState({});
  // Store activity tracking timeout IDs to clean up
  const timeoutsRef = useRef({});
  
  /**
   * Track and broadcast a user action with rate limiting
   * @param {string} actionType - Type of action (use ACTION_TYPES)
   * @param {Object} data - Related data for the action
   * @param {Object} options - Additional options
   * @param {boolean} options.force - Force tracking even if rate limited
   * @param {string} options.uniqueKey - Unique key for this action (defaults to actionType)
   */
  const trackAction = useCallback((actionType, data, options = {}) => {
    const { force = false, uniqueKey = actionType } = options;
    
    // Create a compound key that combines actionType and entity ID if available
    const entityId = data?.roomId || data?.bookingId || data?.userId || data?.serviceId || '';
    const actionKey = `${uniqueKey}:${entityId}`;
    
    // Special handling for view-related events to prevent excess refreshes
    if (uniqueKey === 'dashboard-view' || actionType.includes('view') || actionType.includes('settings')) {
      if (viewEvents[actionKey] && !force) {
        // Skip this view event as it's too frequent
        return;
      }
      viewEvents[actionKey] = true;
      
      // Clear this view event after a longer period
      setTimeout(() => {
        delete viewEvents[actionKey];
      }, RATE_LIMIT_DURATION);
    }
    
    // Check if this action is being rate limited
    const now = Date.now();
    const lastAction = lastActions[actionKey];
    
    if (lastAction && now - lastAction < RATE_LIMIT_DURATION && !force) {
      // Action is rate limited - skip
      return;
    }
    
    // Track the action
    broadcastAction(actionType, {
      ...data,
      timestamp: new Date(),
      ...options
    });
    
    // Update last action time
    setLastActions(prev => ({
      ...prev,
      [actionKey]: now
    }));
    
    // Clear the rate limit after duration
    if (timeoutsRef.current[actionKey]) {
      clearTimeout(timeoutsRef.current[actionKey]);
    }
    
    timeoutsRef.current[actionKey] = setTimeout(() => {
      setLastActions(prev => {
        const updated = { ...prev };
        delete updated[actionKey];
        return updated;
      });
      delete timeoutsRef.current[actionKey];
    }, RATE_LIMIT_DURATION);
  }, [broadcastAction, lastActions]);
  
  /**
   * Track a room-related action
   * @param {string} actionType - Type of action
   * @param {Object} room - Room data
   * @param {Object} options - Additional options
   */
  const trackRoomAction = useCallback((actionType, room, options = {}) => {
    trackAction(actionType, {
      roomId: room._id,
      roomNumber: room.roomNumber,
      type: room.type,
      entityType: 'room'
    }, options);
  }, [trackAction]);
  
  /**
   * Track a booking-related action
   * @param {string} actionType - Type of action
   * @param {Object} booking - Booking data
   * @param {Object} options - Additional options
   */
  const trackBookingAction = useCallback((actionType, booking, options = {}) => {
    trackAction(actionType, {
      bookingId: booking._id,
      guestName: booking.guestName || (booking.user && booking.user.name),
      roomNumber: booking.room && booking.room.roomNumber,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      entityType: 'booking'
    }, options);
  }, [trackAction]);
  
  /**
   * Track a user-related action
   * @param {string} actionType - Type of action
   * @param {Object} userData - User data
   * @param {Object} options - Additional options
   */
  const trackUserAction = useCallback((actionType, userData, options = {}) => {
    trackAction(actionType, {
      userId: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      entityType: 'user'
    }, options);
  }, [trackAction]);
  
  /**
   * Track a service-related action
   * @param {string} actionType - Type of action
   * @param {Object} service - Service data
   * @param {Object} options - Additional options
   */
  const trackServiceAction = useCallback((actionType, service, options = {}) => {
    trackAction(actionType, {
      serviceId: service._id,
      name: service.name,
      bookingId: service.booking && service.booking._id,
      roomNumber: service.room && service.room.roomNumber,
      entityType: 'service'
    }, options);
  }, [trackAction]);
  
  return {
    trackAction,
    trackRoomAction,
    trackBookingAction,
    trackUserAction,
    trackServiceAction
  };
};

export default useActivityTracker; 