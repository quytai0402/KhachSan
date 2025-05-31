# 🏨 Hotel Management System

<div align="center">
  
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](https://github.com)
[![API](https://img.shields.io/badge/API-59%20Endpoints-blue)](https://github.com)
[![Coverage](https://img.shields.io/badge/AsyncHandler-100%25-green)](https://github.com)
[![Build](https://img.shields.io/badge/Build-Passing-success)](https://github.com)

**Hệ thống quản lý khách sạn hoàn chỉnh với Node.js, React.js và MongoDB**

[Demo](#) • [Documentation](#) • [API Guide](#) • [Deployment](#)

</div>

---

## 📋 Tổng Quan

Hệ thống quản lý khách sạn full-stack được xây dựng với công nghệ hiện đại, cung cấp giải pháp toàn diện cho việc quản lý khách sạn từ booking, quản lý phòng, nhân viên đến báo cáo thống kê.

### ✨ Tính Năng Chính

- 🔐 **Xác thực & Phân quyền** - JWT Authentication với role-based access
- 🏨 **Quản lý phòng** - Room types, availability, pricing, images
- 📅 **Hệ thống booking** - Guest booking, online payment, status tracking
- 👥 **Quản lý người dùng** - Customers, staff, admin management
- 🛎️ **Dịch vụ khách sạn** - Room service, maintenance requests
- 📊 **Dashboard & Analytics** - Real-time statistics và reporting
- 🎯 **Chương trình khuyến mãi** - Discount management
- 📋 **Task Management** - Staff task assignment và tracking
- 🌐 **Đa ngôn ngữ** - Hỗ trợ tiếng Việt và tiếng Anh
- 📱 **Responsive Design** - Mobile-friendly interface

---

## 🏗️ Kiến Trúc Hệ Thống

### Backend (Node.js + Express.js)
```
📦 backend/
├── 📁 routes/          # 9 modules with 59 API endpoints
│   ├── auth.js         # Authentication (4 routes)
│   ├── rooms.js        # Room management (6 routes)
│   ├── bookings.js     # Booking system (8 routes)
│   ├── users.js        # User management (6 routes)
│   ├── services.js     # Hotel services (8 routes)
│   ├── admin.js        # Admin dashboard (4 routes)
│   ├── staff.js        # Staff management (11 routes)
│   ├── tasks.js        # Task management (6 routes)
│   └── promotions.js   # Promotions (6 routes)
├── 📁 models/          # MongoDB schemas
├── 📁 middleware/      # Auth, error handling, async wrapper
├── 📁 utils/           # Email service, socket events
└── 📁 uploads/         # File storage
```

### Frontend (React.js + Material-UI)
```
📦 frontend/
├── 📁 src/
│   ├── 📁 components/  # Reusable UI components
│   ├── 📁 pages/       # Page components (30+ pages)
│   ├── 📁 services/    # API service layer
│   ├── 📁 context/     # React contexts
│   ├── 📁 hooks/       # Custom hooks
│   └── 📁 utils/       # Utilities & i18n
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB 4.4+
- npm or yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd KhachSan
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Database Setup
```bash
# Create default admin user
cd backend
node createAdmin.js

# Seed sample data (optional)
node seed-data.js
```

---

## 🔧 Environment Configuration

### Backend (.env)
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/hotel-management

# JWT
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRE=30d

# Server
PORT=5000
NODE_ENV=development

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Client URL
CLIENT_URL=http://localhost:3000
```

### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Room Management
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/available` - Check availability
- `POST /api/rooms` - Create new room
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

### Booking System
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/status` - Update status
- `DELETE /api/bookings/:id` - Cancel booking

[**📖 Complete API Documentation**](./API_DOCUMENTATION.md)

---

## 🧪 Testing

### Run API Tests
```bash
# Make sure backend is running on localhost:5000
./test-api.sh

# Or with custom configuration
API_BASE_URL=http://localhost:5000/api ./test-api.sh
```

### Manual Testing
```bash
# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hotel.com","password":"password123"}'

# Test room availability
curl -X GET "http://localhost:5000/api/rooms/available?checkIn=2025-06-01&checkOut=2025-06-05"
```

---

## 🚀 Production Deployment

### Quick Deploy Commands
```bash
# Backend
cd backend
npm install --production
pm2 start index.js --name "hotel-backend"

# Frontend
cd frontend
npm run build
# Deploy build/ folder to your web server
```

[**📖 Detailed Deployment Guide**](./PRODUCTION_DEPLOYMENT_GUIDE.md)

---

## 📊 System Statistics

| Module | API Routes | Status | Coverage |
|--------|------------|--------|----------|
| Authentication | 4 | ✅ Complete | 100% |
| Room Management | 6 | ✅ Complete | 100% |
| Booking System | 8 | ✅ Complete | 100% |
| User Management | 6 | ✅ Complete | 100% |
| Hotel Services | 8 | ✅ Complete | 100% |
| Admin Dashboard | 4 | ✅ Complete | 100% |
| Staff Management | 11 | ✅ Complete | 100% |
| Task Management | 6 | ✅ Complete | 100% |
| Promotions | 6 | ✅ Complete | 100% |
| **TOTAL** | **59** | **✅ Complete** | **100%** |

---

## 🛡️ Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Role-based Access Control** - Admin/Staff/User roles
- ✅ **Input Validation** - Comprehensive data validation
- ✅ **XSS Protection** - Cross-site scripting prevention
- ✅ **CORS Configuration** - Cross-origin resource sharing
- ✅ **Rate Limiting** - API abuse prevention
- ✅ **Secure Headers** - Security HTTP headers
- ✅ **Environment Variables** - Sensitive data protection

---

## 🌟 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File upload
- **Socket.IO** - Real-time communication
- **Nodemailer** - Email service

### Frontend
- **React.js** - UI framework
- **Material-UI** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time updates
- **Date-fns** - Date manipulation
- **React Context** - State management

### Development Tools
- **Nodemon** - Auto-restart
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **PM2** - Process management

---

## 📁 Project Structure

```
KhachSan/
├── 📄 README.md                           # This file
├── 📄 FINAL_COMPLETION_REPORT.md          # Completion status
├── 📄 PRODUCTION_DEPLOYMENT_GUIDE.md      # Deployment guide
├── 📄 test-api.sh                         # API testing script
├── 📁 backend/                            # Node.js backend
│   ├── 📄 index.js                        # Main server file
│   ├── 📄 package.json                    # Dependencies
│   ├── 📁 routes/                         # API routes
│   ├── 📁 models/                         # Database models
│   ├── 📁 middleware/                     # Express middleware
│   ├── 📁 utils/                          # Utility functions
│   └── 📁 uploads/                        # File storage
└── 📁 frontend/                           # React frontend
    ├── 📄 package.json                    # Dependencies
    ├── 📁 src/                            # Source code
    ├── 📁 public/                         # Public assets
    └── 📁 build/                          # Production build
```

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Tran Quy Tai**  
📧 Email: [your-email@example.com](mailto:your-email@example.com)  
🌐 GitHub: [@your-username](https://github.com/your-username)

---

## 🙏 Acknowledgments

- Material-UI team for the amazing component library
- MongoDB team for the excellent database
- React team for the powerful frontend framework
- Express.js team for the minimalist web framework

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ by Tran Quy Tai

</div>
