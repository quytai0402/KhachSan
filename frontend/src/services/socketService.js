import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
    this.API_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
    this.reconnectTimer = null;
    this.isDisconnecting = false;
    this.connectionInProgress = false;
  }

  // Initialize socket connection
  connect(token, userId, role) {
    try {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      // Prevent multiple concurrent connection attempts
      if (this.connectionInProgress) {
        console.log('Connection already in progress, skipping');
        return this.socket || {
          connected: false,
          on: () => {},
          off: () => {},
          emit: () => {}
        };
      }

      if (!this.socket) {
        console.log('Connecting to socket server...');
        this.isDisconnecting = false;
        this.connectionInProgress = true;
        
        this.socket = io(this.API_URL, {
          auth: { token },
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 5,
          reconnectionDelay: 3000,
          timeout: 15000,
          reconnection: true,
          forceNew: false,
          extraHeaders: {
            "x-auth-token": token
          },
          withCredentials: true
        });

        this.socket.on('connect', () => {
          console.log('Socket connected');
          this.reconnectAttempts = 0;
          this.connectionInProgress = false;
          
          // Join role-based room
          if (role) {
            this.socket.emit('join-role', role);
          }
          
          // Join user-specific room
          if (userId) {
            this.socket.emit('join-user', userId);
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          this.connectionInProgress = false;
          this._handleReconnect();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          this.connectionInProgress = false;
          
          if (!this.isDisconnecting && reason !== 'io client disconnect') {
            this._handleReconnect();
          }
        });
        
        // Keep-alive ping
        this._startKeepAlive();
      }
      
      return this.socket;
    } catch (error) {
      console.error('Failed to connect to socket server:', error);
      this.connectionInProgress = false;
      this._handleReconnect();
      return {
        connected: false,
        on: () => {},
        off: () => {},
        emit: () => {}
      };
    }
  }

  // Handle reconnection logic
  _handleReconnect() {
    if (this.isDisconnecting) return;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Socket attempting to reconnect: Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      this.reconnectTimer = setTimeout(() => {
        if (this.socket) {
          this.socket.connect();
        }
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached. Please refresh the page.');
    }
  }

  // Send periodic ping to keep connection alive
  _startKeepAlive() {
    setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('ping', { timestamp: new Date().toISOString() });
      }
    }, 30000); // Every 30 seconds
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      try {
        this.isDisconnecting = true;
        
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        
        this.socket.disconnect();
      } catch (error) {
        console.error('Error disconnecting socket:', error);
      }
      this.socket = null;
    }
  }

  // Subscribe to an event
  on(event, callback) {
    if (!this.socket) {
      console.error('Socket not connected');
      return () => {};
    }

    try {
      // Remove existing listener for this event if any
      this.off(event);
      
      // Add new listener
      this.socket.on(event, callback);
      this.listeners[event] = callback;
      
      return () => this.off(event);
    } catch (error) {
      console.error(`Error subscribing to event ${event}:`, error);
      return () => {};
    }
  }

  // Unsubscribe from an event
  off(event) {
    if (!this.socket) return;
    
    try {
      if (this.listeners[event]) {
        this.socket.off(event, this.listeners[event]);
        delete this.listeners[event];
      }
    } catch (error) {
      console.error(`Error unsubscribing from event ${event}:`, error);
    }
  }

  // Emit an event
  emit(event, data) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    
    try {
      this.socket.emit(event, data);
    } catch (error) {
      console.error(`Error emitting event ${event}:`, error);
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check if socket is connected
  isConnected() {
    return this.socket && this.socket.connected;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService; 