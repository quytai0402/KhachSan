const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { 
  HTTP_STATUS, 
  ERROR_MESSAGES,
  SERVICE_STATUS,
  VALIDATION_RULES 
} = require('../constants');
const Service = require('../models/Service');
const Feature = require('../models/Feature');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/services');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/services');
  },
  filename: (req, file, cb) => {
    cb(null, `service-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
});

// @route   GET api/services/features
// @desc    Get all active hotel features/services for homepage
// @access  Public
router.get('/features', asyncHandler(async (req, res) => {
  // Get all active features ordered by their display order
  const features = await Feature.find({ isActive: true }).sort({ order: 1 });
  res.status(HTTP_STATUS.OK).json({ success: true, data: features });
}));

// @route   POST api/services/features
// @desc    Add a new hotel feature
// @access  Private (Admin only)
router.post('/features', [auth, admin], asyncHandler(async (req, res) => {
  const { title, description, type, order, isActive } = req.body;
  
  const newFeature = new Feature({
    title,
    description,
    type: type || 'other',
    order: order || 1,
    isActive: isActive !== undefined ? isActive : true
  });
  
  await newFeature.save();
  res.status(HTTP_STATUS.CREATED).json({ success: true, data: newFeature });
}));

// @route   PUT api/services/features/:id
// @desc    Update a hotel feature
// @access  Private (Admin only)
router.put('/features/:id', [auth, admin], asyncHandler(async (req, res) => {
  const { title, description, type, order, isActive } = req.body;
  
  // Check if feature exists
  let feature = await Feature.findById(req.params.id);
  if (!feature) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ 
      message: 'Feature not found' 
    });
  }
  
  // Build feature update object
  const featureFields = {};
  if (title) featureFields.title = title;
  if (description) featureFields.description = description;
  if (type) featureFields.type = type;
  if (order !== undefined) featureFields.order = order;
  if (isActive !== undefined) featureFields.isActive = isActive;
  
  // Update feature
  feature = await Feature.findByIdAndUpdate(
    req.params.id,
    { $set: featureFields },
    { new: true }
  );
  
  res.status(HTTP_STATUS.OK).json({ success: true, data: feature });
}));

// @route   DELETE api/services/features/:id
// @desc    Delete a hotel feature
// @access  Private (Admin only)
router.delete('/features/:id', [auth, admin], asyncHandler(async (req, res) => {
  // Check if feature exists
  const feature = await Feature.findById(req.params.id);
  if (!feature) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ 
      message: 'Feature not found' 
    });
  }
  
  // Delete feature
  await Feature.findByIdAndDelete(req.params.id);
  res.status(HTTP_STATUS.OK).json({ 
    message: 'Feature removed successfully' 
  });
}));

// @route   GET api/services
// @desc    Get all services
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const services = await Service.find().sort({ createdAt: -1 });
  res.status(HTTP_STATUS.OK).json({ success: true, data: services });
}));

// @route   GET api/services/:id
// @desc    Get service by ID
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  
  if (!service) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ 
      message: 'Service not found' 
    });
  }
  
  res.status(HTTP_STATUS.OK).json({ success: true, data: service });
}));

// @route   GET api/services/category/:category
// @desc    Get services by category
// @access  Public
router.get('/category/:category', asyncHandler(async (req, res) => {
  const services = await Service.find({ 
    category: req.params.category,
    isAvailable: true 
  }).sort({ createdAt: -1 });
  
  res.status(HTTP_STATUS.OK).json({ success: true, data: services });
}));

// @route   POST api/services
// @desc    Create a service
// @access  Private (Admin only)
router.post('/', [auth, admin, upload.single('image')], asyncHandler(async (req, res) => {
  const { name, description, price, category } = req.body;

  console.log('Creating new service with data:', req.body);
  
  // Validate required fields
  if (!name || !description || !price) {
    console.error('Missing required fields:', { name, description, price });
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
      message: ERROR_MESSAGES.INVALID_INPUT 
    });
  }

  // Create new service
  const newService = new Service({
    name,
    description,
    price,
    category: category || 'other'
  });

  // Add image path if uploaded
  if (req.file) {
    console.log('Processing uploaded image:', req.file.filename);
    newService.image = `/uploads/services/${req.file.filename}`;
  }

  // Save service to database
  const service = await newService.save();
  console.log('Service created successfully:', service._id);
  res.status(HTTP_STATUS.CREATED).json({ success: true, data: service });
}));

// @route   PUT api/services/:id
// @desc    Update a service
// @access  Private (Admin only)
router.put('/:id', [auth, admin, upload.single('image')], asyncHandler(async (req, res) => {
  const { name, description, price, category, isAvailable } = req.body;

  // Build service object
  const serviceFields = {};
  if (name) serviceFields.name = name;
  if (description) serviceFields.description = description;
  if (price) serviceFields.price = price;
  if (category) serviceFields.category = category;
  if (isAvailable !== undefined) serviceFields.isAvailable = isAvailable === 'true';

  // Check if service exists
  let service = await Service.findById(req.params.id);
  if (!service) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ 
      message: 'Service not found' 
    });
  }

  // Add new image if uploaded
  if (req.file) {
    serviceFields.image = `/uploads/services/${req.file.filename}`;
  }

  // Update service
  service = await Service.findByIdAndUpdate(
    req.params.id,
    { $set: serviceFields },
    { new: true }
  );

  res.status(HTTP_STATUS.OK).json({ success: true, data: service });
}));

// @route   DELETE api/services/:id
// @desc    Delete a service
// @access  Private (Admin only)
router.delete('/:id', [auth, admin], asyncHandler(async (req, res) => {
  // Check if service exists
  const service = await Service.findById(req.params.id);
  if (!service) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ 
      message: 'Service not found' 
    });
  }

  // Delete service
  await Service.findByIdAndDelete(req.params.id);
  res.status(HTTP_STATUS.OK).json({ 
    message: 'Service removed successfully' 
  });
}));

module.exports = router; 