const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
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
router.get('/features', async (req, res) => {
  try {
    // Get all active features ordered by their display order
    const features = await Feature.find({ isActive: true }).sort({ order: 1 });
    res.json(features);
  } catch (err) {
    console.error('Error fetching features:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/services/features
// @desc    Add a new hotel feature
// @access  Private (Admin only)
router.post('/features', [auth, admin], async (req, res) => {
  const { title, description, type, order, isActive } = req.body;
  
  try {
    const newFeature = new Feature({
      title,
      description,
      type: type || 'other',
      order: order || 1,
      isActive: isActive !== undefined ? isActive : true
    });
    
    await newFeature.save();
    res.json(newFeature);
  } catch (err) {
    console.error('Error creating feature:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/services/features/:id
// @desc    Update a hotel feature
// @access  Private (Admin only)
router.put('/features/:id', [auth, admin], async (req, res) => {
  const { title, description, type, order, isActive } = req.body;
  
  try {
    // Check if feature exists
    let feature = await Feature.findById(req.params.id);
    if (!feature) {
      return res.status(404).json({ message: 'Feature not found' });
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
    
    res.json(feature);
  } catch (err) {
    console.error('Error updating feature:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Feature not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/services/features/:id
// @desc    Delete a hotel feature
// @access  Private (Admin only)
router.delete('/features/:id', [auth, admin], async (req, res) => {
  try {
    // Check if feature exists
    const feature = await Feature.findById(req.params.id);
    if (!feature) {
      return res.status(404).json({ message: 'Feature not found' });
    }
    
    // Delete feature
    await Feature.findByIdAndRemove(req.params.id);
    res.json({ message: 'Feature removed' });
  } catch (err) {
    console.error('Error deleting feature:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Feature not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/services
// @desc    Get all services
// @access  Public
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/services/:id
// @desc    Get service by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(service);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/services/category/:category
// @desc    Get services by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const services = await Service.find({ 
      category: req.params.category,
      isAvailable: true 
    }).sort({ createdAt: -1 });
    
    res.json(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/services
// @desc    Create a service
// @access  Private (Admin only)
router.post('/', [auth, admin, upload.single('image')], async (req, res) => {
  const { name, description, price, category } = req.body;

  try {
    console.log('Creating new service with data:', req.body);
    
    // Validate required fields
    if (!name || !description || !price) {
      console.error('Missing required fields:', { name, description, price });
      return res.status(400).json({ message: 'Please provide all required fields' });
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
    res.json(service);
  } catch (err) {
    console.error('Error creating service:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: err.errors });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT api/services/:id
// @desc    Update a service
// @access  Private (Admin only)
router.put('/:id', [auth, admin, upload.single('image')], async (req, res) => {
  const { name, description, price, category, isAvailable } = req.body;

  // Build service object
  const serviceFields = {};
  if (name) serviceFields.name = name;
  if (description) serviceFields.description = description;
  if (price) serviceFields.price = price;
  if (category) serviceFields.category = category;
  if (isAvailable !== undefined) serviceFields.isAvailable = isAvailable === 'true';

  try {
    // Check if service exists
    let service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
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

    res.json(service);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/services/:id
// @desc    Delete a service
// @access  Private (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    // Check if service exists
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Delete service
    await Service.findByIdAndRemove(req.params.id);
    res.json({ message: 'Service removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 