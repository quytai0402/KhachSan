# API Issues Priority Fix List

## 🔥 IMMEDIATE ACTION REQUIRED

### Issue Summary
- **API Consistency Rate:** 78% (cần đạt 95%+)
- **Critical Issues:** 8 items
- **Medium Issues:** 6 items  
- **Low Issues:** 3 items
- **Total Missing APIs:** 10+ functions

---

## 🚨 PRIORITY 1: CRITICAL FIXES (Làm ngay - 1-2 ngày)

### 1.1 Frontend Missing API Calls (8 items)

```javascript
// File: /frontend/src/services/api.js

// 1. Room API additions
export const roomAPI = {
  // ...existing code...
  
  // ➕ ADD THIS:
  getFeaturedRooms: () => api.get(`${API_ENDPOINTS.ROOMS.BASE}/featured`),
};

// 2. Service API additions  
export const serviceAPI = {
  // ...existing code...
  
  // ➕ ADD THIS:
  getServicesByCategory: (category) => 
    api.get(`${API_ENDPOINTS.SERVICES.BASE}/category/${category}`),
};

// 3. Booking API additions
export const bookingAPI = {
  // ...existing code...
  
  // ➕ ADD THESE:
  updateBookingPayment: (id, paymentData) => 
    api.put(`${API_ENDPOINTS.BOOKINGS.BASE}/${id}/payment`, paymentData),
  cancelBooking: (id) => 
    api.put(`${API_ENDPOINTS.BOOKINGS.BASE}/${id}/cancel`),
};

// 4. User API additions
export const userAPI = {
  // ...existing code...
  
  // ➕ ADD THIS:
  createAdmin: (userData) => 
    api.post(`${API_ENDPOINTS.USERS.BASE}/admin`, userData),
};

// 5. Staff API additions
export const staffAPI = {
  // ...existing code...
  
  // ➕ ADD THESE:
  updateRoomStatus: (id, statusData) => 
    api.post(`${API_ENDPOINTS.STAFF.ROOMS}/${id}/status`, statusData),
  completeGuestRequest: (id) => 
    api.post(`${API_ENDPOINTS.STAFF.SERVICES}/${id}/complete`),
  updateStaffRoom: (id, data) => 
    api.put(`${API_ENDPOINTS.STAFF.ROOMS}/${id}`, data), // Backend route missing
};
```

### 1.2 Backend Missing Routes (2 critical)

```javascript
// File: /backend/routes/staff.js

// ➕ ADD THIS ROUTE:
// @route   PUT api/staff/rooms/:id  
// @desc    Update room details (for staff)
// @access  Private (Staff only)
router.put('/rooms/:id', [auth, staff], asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  
  if (!room) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: ERROR_MESSAGES.ROOM_NOT_FOUND
    });
  }
  
  // Staff can only update certain fields
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

```javascript
// File: /backend/routes/tasks.js

// ➕ ADD THESE ROUTES:
// @route   POST api/tasks
// @desc    Create a new task
// @access  Private (Admin/Staff)
router.post('/', [auth], asyncHandler(async (req, res) => {
  // Verify user role
  if (req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.STAFF) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ 
      message: ERROR_MESSAGES.UNAUTHORIZED 
    });
  }
  
  const { title, description, type, priority, assignedTo, room, dueDate } = req.body;
  
  // Validate required fields
  if (!title || !type) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: ERROR_MESSAGES.REQUIRED_FIELDS
    });
  }
  
  const newTask = new Task({
    title,
    description,
    type,
    priority: priority || TASK_PRIORITY.NORMAL,
    assignedTo,
    room,
    dueDate,
    createdBy: req.user.id,
    status: TASK_STATUS.PENDING
  });
  
  await newTask.save();
  res.status(HTTP_STATUS.CREATED).json({ success: true, data: newTask });
}));

// @route   PUT api/tasks/:id
// @desc    Update a task
// @access  Private (Admin/Staff)
router.put('/:id', [auth], asyncHandler(async (req, res) => {
  if (req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.STAFF) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ 
      message: ERROR_MESSAGES.UNAUTHORIZED 
    });
  }
  
  const task = await Task.findById(req.params.id);
  
  if (!task) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ 
      message: 'Task not found' 
    });
  }
  
  // Check if user can update this task
  if (req.user.role === USER_ROLES.STAFF && 
      task.assignedTo && 
      task.assignedTo.toString() !== req.user.id) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      message: 'You can only update tasks assigned to you'
    });
  }
  
  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: new Date() },
    { new: true }
  ).populate('assignedTo', 'name email')
   .populate('room', 'roomNumber type')
   .populate('createdBy', 'name email');
  
  res.json({ success: true, data: updatedTask });
}));

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Private (Admin only)
router.delete('/:id', [auth], asyncHandler(async (req, res) => {
  if (req.user.role !== USER_ROLES.ADMIN) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ 
      message: ERROR_MESSAGES.UNAUTHORIZED 
    });
  }
  
  const task = await Task.findById(req.params.id);
  
  if (!task) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ 
      message: 'Task not found' 
    });
  }
  
  await Task.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Task deleted successfully' });
}));
```

---

## ⚠️ PRIORITY 2: RESPONSE STANDARDIZATION (1 ngày)

### 2.1 Standard Response Format

```javascript
// Tất cả API responses nên follow format này:
{
  success: boolean,
  data?: any,
  message?: string,
  error?: any,
  meta?: {
    total?: number,
    page?: number,
    limit?: number
  }
}
```

### 2.2 Files cần cập nhật:

```javascript
// ⚠️ CẦN STANDARDIZE các files sau:

// Backend routes cần fix response format:
// - /backend/routes/rooms.js (lines: 57, 134, 284)
// - /backend/routes/bookings.js (lines: 592, 416) 
// - /backend/routes/users.js (lines: 166, 197)
// - /backend/routes/services.js (lines: 121, 153)

// Example fix for rooms.js:
// ❌ BEFORE: res.json(featuredRooms);
// ✅ AFTER:  res.json({ success: true, data: featuredRooms });
```

---

## ⚠️ PRIORITY 3: ERROR HANDLING (1 ngày)

### 3.1 Consistent Error Responses

```javascript
// ❌ HIỆN TẠI: Multiple error formats
res.status(404).json({ message: 'Not found' });
res.status(400).send('Bad request');
res.status(500).json({ error: 'Server error' });

// ✅ CHUẨN HÓA thành:
res.status(404).json({ 
  success: false, 
  message: 'Resource not found',
  error: 'NOT_FOUND'
});
```

### 3.2 Add AsyncHandler to All Routes

```javascript
// ❌ Routes thiếu asyncHandler:
// - /backend/routes/rooms.js (lines: 57, 84, 163)
// - /backend/routes/bookings.js (lines: 229, 384, 471)

// ✅ Ensure tất cả routes sử dụng:
router.get('/', asyncHandler(async (req, res) => {
  // Route logic here
}));
```

---

## 🔧 PRIORITY 4: TESTING & VALIDATION (1 ngày)

### 4.1 Missing Frontend Validation

```javascript
// Add validation cho new API calls:

// In roomAPI.js:
getFeaturedRooms: async () => {
  try {
    const response = await api.get(`${API_ENDPOINTS.ROOMS.BASE}/featured`);
    return response;
  } catch (error) {
    console.error('Error fetching featured rooms:', error);
    throw error;
  }
},
```

### 4.2 API Endpoint Testing

```javascript
// ✅ Test endpoints cần validate:
const testEndpoints = [
  'GET /api/rooms/featured',
  'GET /api/services/category/spa',
  'PUT /api/bookings/:id/payment',
  'PUT /api/bookings/:id/cancel',
  'POST /api/users/admin',
  'POST /api/staff/rooms/:id/status',
  'POST /api/staff/services/:id/complete',
  'PUT /api/staff/rooms/:id',
  'POST /api/tasks',
  'PUT /api/tasks/:id',
  'DELETE /api/tasks/:id'
];
```

---

## 📋 IMPLEMENTATION SCHEDULE

### Day 1: Critical Frontend APIs
- [ ] Add 8 missing frontend API calls
- [ ] Update constants file
- [ ] Test API calls functionality
- **Goal:** Frontend có đầy đủ API calls

### Day 2: Critical Backend Routes  
- [ ] Add missing task CRUD routes
- [ ] Add staff room update route
- [ ] Add proper error handling
- **Goal:** Backend routes hoàn chỉnh

### Day 3: Response Standardization
- [ ] Standardize all response formats
- [ ] Fix error handling consistency
- [ ] Add asyncHandler to missing routes
- **Goal:** 100% consistent responses

### Day 4: Testing & Validation
- [ ] Test all new endpoints
- [ ] Validate API consistency
- [ ] Update documentation
- **Goal:** 95%+ API reliability

---

## 📊 SUCCESS METRICS

| Metric | Current | Target | Priority |
|--------|---------|--------|----------|
| API Consistency | 78% | 95%+ | 🔥 |
| Response Format Std | 60% | 100% | ⚠️ |
| Error Handling | 70% | 100% | ⚠️ |
| Missing APIs | 10+ | 0 | 🔥 |
| Documentation | 80% | 100% | 🔧 |

---

## 🎯 FINAL VALIDATION CHECKLIST

### Critical Requirements ✅
- [ ] All backend routes have matching frontend API calls
- [ ] All frontend API calls have corresponding backend routes  
- [ ] Response formats are consistent across all endpoints
- [ ] Error handling follows standard patterns
- [ ] Authentication/authorization is properly implemented

### Testing Requirements ✅
- [ ] All endpoints return expected response format
- [ ] Error cases return proper error responses
- [ ] API calls handle errors gracefully
- [ ] Frontend properly consumes API responses

### Documentation Requirements ✅
- [ ] All endpoints documented in README
- [ ] API constants updated
- [ ] Error codes documented
- [ ] Implementation notes added

---

**⚡ START WITH:** Frontend missing API calls (Day 1)
**🎯 END GOAL:** 95%+ API consistency và zero critical issues

Hoàn thành checklist này sẽ giải quyết được **tất cả 22% API inconsistency issues** và đưa hệ thống lên độ tin cậy **95%+**.
