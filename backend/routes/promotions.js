const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const Promotion = require('../models/Promotion');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/promotions');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/promotions');
  },
  filename: (req, file, cb) => {
    cb(null, `promo-${Date.now()}${path.extname(file.originalname)}`);
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

// @route   GET api/promotions
// @desc    Get all active promotions
// @access  Public
router.get('/', async (req, res) => {
  try {
    const currentDate = new Date();
    const promotions = await Promotion.find({
      isActive: true,
      validFrom: { $lte: currentDate },
      validTo: { $gte: currentDate }
    }).sort({ validTo: 1 });
    
    res.json(promotions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/promotions/all
// @desc    Get all promotions (including inactive ones)
// @access  Private (Admin only)
router.get('/all', [auth, admin], async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });
    res.json(promotions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/promotions/code/:code
// @desc    Validate promotion code
// @access  Public
router.get('/code/:code', async (req, res) => {
  try {
    const currentDate = new Date();
    const promotion = await Promotion.findOne({
      code: req.params.code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: currentDate },
      validTo: { $gte: currentDate }
    });
    
    if (!promotion) {
      return res.status(404).json({ 
        valid: false,
        message: 'Invalid or expired promotion code' 
      });
    }
    
    res.json({
      valid: true,
      promotion
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/promotions/:id
// @desc    Get promotion by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    
    res.json(promotion);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/promotions
// @desc    Create a promotion
// @access  Private (Admin only)
router.post('/', [auth, admin, upload.single('image')], async (req, res) => {
  const {
    name,
    title,
    code,
    description,
    discountType,
    discountValue,
    validFrom,
    validTo,
    applicableRoomTypes,
    minimumStay
  } = req.body;

  try {
    console.log('Creating new promotion with data:', req.body);
    
    // Validate required fields
    if (!name || !code || !description || !discountValue || !validFrom || !validTo) {
      console.error('Missing required fields:', { name, code, description, discountValue, validFrom, validTo });
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if code already exists
    const existingPromotion = await Promotion.findOne({ code: code.toUpperCase() });
    if (existingPromotion) {
      console.error('Promotion code already exists:', code);
      return res.status(400).json({ message: 'Promotion code already exists' });
    }

    // Format dates
    const formattedValidFrom = new Date(validFrom);
    const formattedValidTo = new Date(validTo);
    
    // Validate dates
    if (formattedValidTo <= formattedValidFrom) {
      console.error('Invalid date range:', { validFrom, validTo });
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Calculate discount percentage if discount type is fixed
    let discountPercent = discountType === 'percentage' ? 
      parseInt(discountValue) : 
      Math.round((parseInt(discountValue) / 100) * 100);

    // Create new promotion
    const newPromotion = new Promotion({
      name,
      title: title || name,
      code: code.toUpperCase(),
      description,
      discountType: discountType || 'percentage',
      discountValue: parseInt(discountValue),
      discountPercent,
      validFrom: formattedValidFrom,
      validTo: formattedValidTo,
      applicableRoomTypes: Array.isArray(applicableRoomTypes) 
        ? applicableRoomTypes 
        : (applicableRoomTypes ? [applicableRoomTypes] : ['all']),
      minimumStay: minimumStay || 1
    });

    // Add image path if uploaded
    if (req.file) {
      newPromotion.image = `/uploads/promotions/${req.file.filename}`;
    }

    // Save promotion to database
    const promotion = await newPromotion.save();
    console.log('Promotion created successfully:', promotion._id);
    res.json(promotion);
  } catch (err) {
    console.error('Error creating promotion:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: err.errors });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT api/promotions/:id
// @desc    Update a promotion
// @access  Private (Admin only)
router.put('/:id', [auth, admin, upload.single('image')], async (req, res) => {
  const {
    name,
    title,
    description,
    discountType,
    discountValue,
    validFrom,
    validTo,
    isActive,
    applicableRoomTypes,
    minimumStay
  } = req.body;

  // Build promotion object
  const promotionFields = {};
  if (name) promotionFields.name = name;
  if (title) promotionFields.title = title;
  if (description) promotionFields.description = description;
  if (discountType) promotionFields.discountType = discountType;
  
  if (discountValue) {
    promotionFields.discountValue = parseInt(discountValue);
    // Calculate discount percentage if applicable
    if (discountType) {
      promotionFields.discountPercent = discountType === 'percentage' ? 
        parseInt(discountValue) : 
        Math.round((parseInt(discountValue) / 100) * 100);
    }
  }
  
  if (validFrom) promotionFields.validFrom = new Date(validFrom);
  if (validTo) promotionFields.validTo = new Date(validTo);
  if (isActive !== undefined) promotionFields.isActive = isActive;
  if (applicableRoomTypes) {
    promotionFields.applicableRoomTypes = Array.isArray(applicableRoomTypes) 
      ? applicableRoomTypes 
      : [applicableRoomTypes];
  }
  if (minimumStay) promotionFields.minimumStay = minimumStay;

  try {
    // Check if promotion exists
    let promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    // Add image path if uploaded
    if (req.file) {
      promotionFields.image = `/uploads/promotions/${req.file.filename}`;
    }

    // Update promotion
    promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      { $set: promotionFields },
      { new: true }
    );

    res.json(promotion);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/promotions/:id
// @desc    Delete a promotion
// @access  Private (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    // Check if promotion exists
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    // Delete promotion
    await Promotion.findByIdAndRemove(req.params.id);
    res.json({ message: 'Promotion removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 