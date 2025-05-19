import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import socketService from '../services/socketService';
import { useAuth } from './AuthContext';
import * as socketEvents from '../utils/socketEvents';

// Create context
const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const [roomUpdates, setRoomUpdates] = useState([]);
  const [bookingUpdates, setBookingUpdates] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [staffActivity, setStaffActivity] = useState([]);
  const [adminActivity, setAdminActivity] = useState([]);
  const socketInitialized = useRef(false);

  // Connect to socket when user logs in
  useEffect(() => {
    if (isAuthenticated && user && !socketInitialized.current) {
      // Connect to socket only once
      socketInitialized.current = true;
      const socket = socketService.connect(user.token, user._id, user.role);
      
      // Update connection status
      setConnected(socket.connected);
      
      // Handle connection events
      socket.on('connect', () => setConnected(true));
      socket.on('disconnect', () => setConnected(false));
      
      // Setup notification listener
      socketService.on(socketEvents.NOTIFICATION, (notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 50));
      });
      
      // Setup global notification listener
      socketService.on(socketEvents.GLOBAL_NOTIFICATION, (notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 50));
      });
      
      // Handle room status changes without triggering excessive re-renders
      socketService.on(socketEvents.ROOM_STATUS_CHANGED, (update) => {
        // Only add update if we don't already have one with the same roomId
        setRoomUpdates(prev => {
          const exists = prev.some(item => item.roomId === update.roomId);
          if (exists) {
            return prev.map(item => item.roomId === update.roomId ? update : item);
          }
          return [update, ...prev].slice(0, 20);
        });
      });
      
      // Handle booking updates
      socketService.on(socketEvents.BOOKING_CREATED, (booking) => {
        setBookingUpdates(prev => [{ type: 'created', booking, timestamp: new Date() }, ...prev].slice(0, 20));
      });
      
      socketService.on(socketEvents.BOOKING_UPDATED, (booking) => {
        setBookingUpdates(prev => [{ type: 'updated', booking, timestamp: new Date() }, ...prev].slice(0, 20));
      });
      
      socketService.on(socketEvents.BOOKING_CANCELED, (booking) => {
        setBookingUpdates(prev => [{ type: 'canceled', booking, timestamp: new Date() }, ...prev].slice(0, 20));
      });
      
      // Handle staff activity for admins to monitor
      socketService.on(socketEvents.STAFF_ACTIVITY, (activity) => {
        if (user.role === 'admin') {
          setStaffActivity(prev => [activity, ...prev].slice(0, 20));
        }
      });
      
      // Handle admin actions for staff to be aware of
      socketService.on(socketEvents.ADMIN_ACTIVITY, (activity) => {
        if (user.role === 'staff') {
          setAdminActivity(prev => [activity, ...prev].slice(0, 20));
        }
      });
      
      // System-wide important alerts for all roles
      socketService.on(socketEvents.SYSTEM_ALERT, (alert) => {
        setSystemAlerts(prev => [alert, ...prev].slice(0, 10));
      });
      
      // Cleanup on unmount
      return () => {
        socketService.disconnect();
        socketInitialized.current = false;
      };
    } else {
      // Disconnect if no user
      socketService.disconnect();
      socketInitialized.current = false;
      setConnected(false);
    }
  }, [isAuthenticated, user]);

  // Track and broadcast user actions if needed
  const broadcastAction = (action, data) => {
    if (!connected) return;
    
    // Determine which event to emit based on user role
    let eventName = '';
    if (user && user.role === 'admin') {
      eventName = socketEvents.ADMIN_ACTIVITY;
    } else if (user && user.role === 'staff') {
      eventName = socketEvents.STAFF_ACTIVITY;
    } else {
      eventName = socketEvents.USER_ACTIVITY;
    }
    
    socketService.emit(eventName, { 
      action, 
      data, 
      userId: user ? user._id : 'unknown', 
      userName: user ? user.name : 'Unknown User',
      timestamp: new Date() 
    });
  };

  // Expose the context value
  const contextValue = {
    socket: socketService,
    connected,
    notifications,
    clearNotifications: () => setNotifications([]),
    removeNotification: (index) => 
      setNotifications(prev => prev.filter((_, i) => i !== index)),
    roomUpdates,
    bookingUpdates,
    clearRoomUpdates: () => setRoomUpdates([]),
    clearBookingUpdates: () => setBookingUpdates([]),
    systemAlerts,
    clearSystemAlerts: () => setSystemAlerts([]),
    staffActivity,
    clearStaffActivity: () => setStaffActivity([]),
    adminActivity,
    clearAdminActivity: () => setAdminActivity([]),
    broadcastAction
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext; 