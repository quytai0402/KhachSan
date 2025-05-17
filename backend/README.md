# Hotel Management Backend

This is the backend API for the Hotel Management System.

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- Nodemailer for email notifications

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following environment variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/hotel_management
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   NODE_ENV=development
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-email-password
   CLIENT_URL=http://localhost:3000
   ```
4. Create the upload directories:
   ```
   mkdir -p uploads/rooms uploads/services
   ```
5. Run the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication Routes
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user and get token
- GET `/api/auth/user` - Get current user data (protected)

### Room Routes
- GET `/api/rooms` - Get all rooms
- GET `/api/rooms/:id` - Get room by ID
- GET `/api/rooms/available` - Get available rooms by date range
- POST `/api/rooms` - Create a new room (admin only)
- PUT `/api/rooms/:id` - Update room details (admin only)
- DELETE `/api/rooms/:id` - Delete a room (admin only)

### Booking Routes
- GET `/api/bookings` - Get all bookings (admin only)
- GET `/api/bookings/me` - Get current user's bookings
- GET `/api/bookings/:id` - Get booking by ID
- POST `/api/bookings` - Create a new booking
- PUT `/api/bookings/:id/status` - Update booking status (admin only)
- PUT `/api/bookings/:id/payment` - Update payment status (admin only)
- DELETE `/api/bookings/:id` - Cancel a booking

### User Routes
- GET `/api/users` - Get all users (admin only)
- GET `/api/users/:id` - Get user by ID (admin only)
- PUT `/api/users/me` - Update current user profile
- PUT `/api/users/:id` - Update user details (admin only)
- POST `/api/users/admin` - Create an admin user (admin only)
- DELETE `/api/users/:id` - Delete a user (admin only)

### Service Routes
- GET `/api/services` - Get all services
- GET `/api/services/:id` - Get service by ID
- GET `/api/services/category/:category` - Get services by category
- POST `/api/services` - Create a new service (admin only)
- PUT `/api/services/:id` - Update service details (admin only)
- DELETE `/api/services/:id` - Delete a service (admin only)

### Promotion Routes
- GET `/api/promotions` - Get all active promotions
- GET `/api/promotions/all` - Get all promotions (admin only)
- GET `/api/promotions/:id` - Get promotion by ID
- GET `/api/promotions/code/:code` - Validate promotion code
- POST `/api/promotions` - Create a promotion (admin only)
- PUT `/api/promotions/:id` - Update promotion (admin only)
- DELETE `/api/promotions/:id` - Delete a promotion (admin only) 