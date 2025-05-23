const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const serviceRoutes = require('./routes/services');
const promotionRoutes = require('./routes/promotions');
const staffRoutes = require('./routes/staff');
const adminRoutes = require('./routes/admin');
const taskRoutes = require('./routes/tasks');

// Config
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true
  }
});
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Define allowed origins based on environment
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://your-production-domain.com']
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'];

// Enable CORS for all routes
// This needs to come BEFORE any other middleware or routes
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? allowedOrigins 
    : true,  // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'x-auth-token'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight OPTIONS requests manually
app.options('*', (req, res) => {
  res.status(204).end();
});

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
const roomsUploadsDir = path.join(uploadsDir, 'rooms');
const servicesUploadsDir = path.join(uploadsDir, 'services');
const featuresUploadsDir = path.join(uploadsDir, 'features');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(roomsUploadsDir)) {
  fs.mkdirSync(roomsUploadsDir);
}
if (!fs.existsSync(servicesUploadsDir)) {
  fs.mkdirSync(servicesUploadsDir);
}
if (!fs.existsSync(featuresUploadsDir)) {
  fs.mkdirSync(featuresUploadsDir);
}

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tasks', taskRoutes);

// CORS test route
app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS is working',
    headers: req.headers,
    method: req.method,
    origin: req.get('origin') || 'No origin header'
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Hotel Management API is running');
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  try {
    console.log('New client connected:', socket.id);
    
    // Join role-based rooms
    socket.on('join-role', (role) => {
      try {
        if (['admin', 'staff', 'user'].includes(role)) {
          socket.join(role);
          console.log(`Socket ${socket.id} joined ${role} room`);
        }
      } catch (error) {
        console.error('Error in join-role event:', error);
      }
    });

    // Join personal room based on user ID
    socket.on('join-user', (userId) => {
      try {
        if (userId) {
          socket.join(`user-${userId}`);
          console.log(`Socket ${socket.id} joined user-${userId} room`);
        }
      } catch (error) {
        console.error('Error in join-user event:', error);
      }
    });

    // Handle client-side events that might be received
    socket.on('ADMIN_ACTIVITY', (data) => {
      try {
        console.log('Admin activity:', data);
        // Forward the event to specific rooms or users if needed
        socket.to('staff').emit('ADMIN_ACTIVITY', data);
      } catch (error) {
        console.error('Error in ADMIN_ACTIVITY event:', error);
      }
    });

    socket.on('STAFF_ACTIVITY', (data) => {
      try {
        console.log('Staff activity:', data);
        // Forward the event to admin room
        socket.to('admin').emit('STAFF_ACTIVITY', data);
      } catch (error) {
        console.error('Error in STAFF_ACTIVITY event:', error);
      }
    });

    // Handle ping events to keep the connection alive
    socket.on('ping', (data) => {
      try {
        // Simply respond with a pong to keep the connection active
        socket.emit('pong', { timestamp: new Date().toISOString() });
      } catch (error) {
        console.error('Error in ping event:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      try {
        console.log('Client disconnected:', socket.id);
      } catch (error) {
        console.error('Error in disconnect event:', error);
      }
    });
    
    // Handle errors on this socket
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
  } catch (error) {
    console.error('Error in socket connection handler:', error);
  }
});

// Error handler middleware (must be placed after all routes)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application should continue running despite unhandled promise rejections
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 