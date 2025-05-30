# Missing API Implementation Guide

## 🚨 CRITICAL: Frontend API Calls Thiếu

### 1. Room API - Missing Calls

```javascript
// Trong /frontend/src/services/api.js - roomAPI object

// ❌ THIẾU: Featured rooms
getFeaturedRooms: () => api.get(`${API_ENDPOINTS.ROOMS.BASE}/featured`),

// Backend đã có: GET /api/rooms/featured
// Sử dụng trong: Homepage để hiển thị featured rooms
```

### 2. Service API - Missing Calls

```javascript
// Trong /frontend/src/services/api.js - serviceAPI object

// ❌ THIẾU: Get services by category  
getServicesByCategory: (category) => api.get(`${API_ENDPOINTS.SERVICES.BASE}/category/${category}`),

// Backend đã có: GET /api/services/category/:category
// Sử dụng trong: Services page để filter theo category
```

### 3. Booking API - Missing Calls

```javascript
// Trong /frontend/src/services/api.js - bookingAPI object

// ❌ THIẾU: Update payment status
updateBookingPayment: (id, paymentData) => 
  api.put(`${API_ENDPOINTS.BOOKINGS.BASE}/${id}/payment`, paymentData),

// ❌ THIẾU: Cancel booking via PUT (khác với DELETE)
cancelBooking: (id) => 
  api.put(`${API_ENDPOINTS.BOOKINGS.BASE}/${id}/cancel`),

// Backend đã có: 
// - PUT /api/bookings/:id/payment
// - PUT /api/bookings/:id/cancel
// Sử dụng trong: Admin booking management
```

### 4. User API - Missing Calls

```javascript
// Trong /frontend/src/services/api.js - userAPI object

// ❌ THIẾU: Create admin user
createAdmin: (userData) => 
  api.post(`${API_ENDPOINTS.USERS.BASE}/admin`, userData),

// Backend đã có: POST /api/users/admin
// Sử dụng trong: Admin user management để tạo admin accounts
```

### 5. Staff API - Missing Calls

```javascript
// Trong /frontend/src/services/api.js - staffAPI object

// ❌ THIẾU: Update room status
updateRoomStatus: (id, statusData) => 
  api.post(`${API_ENDPOINTS.STAFF.ROOMS}/${id}/status`, statusData),

// ❌ THIẾU: Complete guest request
completeGuestRequest: (id) => 
  api.post(`${API_ENDPOINTS.STAFF.SERVICES}/${id}/complete`),

// Backend đã có:
// - POST /api/staff/rooms/:id/status  
// - POST /api/staff/services/:id/complete
// Sử dụng trong: Staff dashboard và room management
```

## 🚨 CRITICAL: Backend Routes Thiếu

### 1. Task Management Routes

```javascript
// ❌ THIẾU trong /backend/routes/tasks.js

// Create task
router.post('/', [auth, authRole], asyncHandler(async (req, res) => {
  const { title, description, type, priority, assignedTo, room } = req.body;
  
  const newTask = new Task({
    title,
    description,
    type,
    priority: priority || TASK_PRIORITY.NORMAL,
    assignedTo,
    room,
    createdBy: req.user.id,
    status: TASK_STATUS.PENDING
  });
  
  await newTask.save();
  res.status(HTTP_STATUS.CREATED).json({ success: true, data: newTask });
}));

// Update task
router.put('/:id', [auth, authRole], asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  
  if (!task) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ 
      message: ERROR_MESSAGES.TASK_NOT_FOUND 
    });
  }
  
  // Update logic here
  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  
  res.json({ success: true, data: updatedTask });
}));

// Delete task
router.delete('/:id', [auth, authRole], asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  
  if (!task) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ 
      message: ERROR_MESSAGES.TASK_NOT_FOUND 
    });
  }
  
  await Task.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Task deleted successfully' });
}));
```

### 2. Staff Room Update Route

```javascript
// ❌ THIẾU trong /backend/routes/staff.js

// Update room details (khác với update status)
router.put('/rooms/:id', [auth, staff], asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  
  if (!room) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: ERROR_MESSAGES.ROOM_NOT_FOUND
    });
  }
  
  // Staff chỉ được update một số fields nhất định
  const allowedUpdates = ['cleaningStatus', 'notes', 'status'];
  const updates = {};
  
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });
  
  updates.lastUpdated = new Date();
  updates.updatedBy = req.user.id;
  
  const updatedRoom = await Room.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true }
  ).populate('type');
  
  res.json({ success: true, data: updatedRoom });
}));
```

## 📝 CONSTANTS CẦN BỔ SUNG

### 1. Frontend Constants

```javascript
// Trong /frontend/src/constants/index.js

export const API_ENDPOINTS = {
  // ...existing endpoints...
  
  ROOMS: {
    // ...existing...
    FEATURED: '/rooms/featured', // ✅ Đã có
    CATEGORY: '/rooms/category', // Nếu cần thêm room categories
  },
  
  SERVICES: {
    // ...existing...
    CATEGORY: '/services/category', // ✅ Đã có
  },
  
  BOOKINGS: {
    // ...existing...
    PAYMENT: '/bookings', // For payment updates: /:id/payment
    CANCEL: '/bookings',  // For cancellation: /:id/cancel
  },
  
  USERS: {
    // ...existing...
    ADMIN: '/users/admin', // ✅ Cần thêm
  },
  
  STAFF: {
    // ...existing...
    ROOM_STATUS: '/staff/rooms', // For status updates: /:id/status
    SERVICE_COMPLETE: '/staff/services', // For completion: /:id/complete
  }
};
```

### 2. Backend Constants

```javascript
// Trong /backend/constants/index.js (nếu chưa có)

const TASK_CONSTANTS = {
  TYPES: {
    CLEANING: 'cleaning',
    MAINTENANCE: 'maintenance', 
    GUEST_SERVICE: 'guest_service',
    ADMINISTRATIVE: 'administrative'
  },
  PRIORITY: {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent'
  },
  STATUS: {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  }
};

const ERROR_MESSAGES = {
  // ...existing...
  TASK_NOT_FOUND: 'Task not found',
  TASK_ACCESS_DENIED: 'Access denied to this task'
};
```

## 🔧 IMPLEMENTATION PRIORITY

### Phase 1: Critical Missing APIs (1-2 days)

1. **Frontend API calls** - 우선순위 높음
   - `roomAPI.getFeaturedRooms()`
   - `bookingAPI.updateBookingPayment()`  
   - `bookingAPI.cancelBooking()`
   - `staffAPI.updateRoomStatus()`

2. **Backend routes** - 중간 우선순위
   - Task CRUD operations
   - Staff room update route

### Phase 2: Response Standardization (1 day)

```javascript
// Standardize tất cả responses thành format:
{
  success: boolean,
  data?: any,
  message?: string,
  error?: any
}
```

### Phase 3: Error Handling (1 day)

```javascript
// Ensure tất cả routes sử dụng:
- asyncHandler wrapper
- Consistent error responses
- Proper HTTP status codes
```

## 📋 IMPLEMENTATION CHECKLIST

### Frontend Tasks
- [ ] Add `getFeaturedRooms()` to roomAPI
- [ ] Add `getServicesByCategory()` to serviceAPI  
- [ ] Add `updateBookingPayment()` to bookingAPI
- [ ] Add `cancelBooking()` to bookingAPI
- [ ] Add `createAdmin()` to userAPI
- [ ] Add `updateRoomStatus()` to staffAPI
- [ ] Add `completeGuestRequest()` to staffAPI
- [ ] Update API_ENDPOINTS constants
- [ ] Test all new API calls

### Backend Tasks  
- [ ] Add POST /api/tasks route
- [ ] Add PUT /api/tasks/:id route
- [ ] Add DELETE /api/tasks/:id route
- [ ] Add PUT /api/staff/rooms/:id route
- [ ] Add task-related constants
- [ ] Standardize response formats
- [ ] Add proper error handling
- [ ] Test all new routes

### Testing Tasks
- [ ] Unit tests for new API calls
- [ ] Integration tests for API consistency
- [ ] Postman collection updates
- [ ] API documentation updates

## 🎯 SUCCESS METRICS

Sau khi hoàn thành implementation:

- **API Consistency:** 95%+ (từ 78% hiện tại)
- **Missing APIs:** 0 critical missing calls
- **Response Format:** 100% standardized  
- **Error Handling:** 100% consistent
- **Documentation:** 100% API endpoints documented

## 📞 NEXT STEPS

1. **Implement critical missing frontend APIs** (Day 1)
2. **Implement missing backend routes** (Day 2)  
3. **Standardize response formats** (Day 3)
4. **Add comprehensive testing** (Day 4)
5. **Update documentation** (Day 5)

Việc hoàn thành các tasks này sẽ giải quyết được **22% API inconsistency issues** và nâng tổng thể API reliability lên **95%+**.
