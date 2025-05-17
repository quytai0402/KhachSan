const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const Promotion = require('../models/Promotion');

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
router.post('/', [auth, admin], async (req, res) => {
  const {
    name,
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
    // Check if code already exists
    const existingPromotion = await Promotion.findOne({ code: code.toUpperCase() });
    if (existingPromotion) {
      return res.status(400).json({ message: 'Promotion code already exists' });
    }

    // Create new promotion
    const newPromotion = new Promotion({
      name,
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      validFrom,
      validTo,
      applicableRoomTypes: Array.isArray(applicableRoomTypes) 
        ? applicableRoomTypes 
        : [applicableRoomTypes],
      minimumStay: minimumStay || 1
    });

    // Save promotion to database
    const promotion = await newPromotion.save();
    res.json(promotion);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/promotions/:id
// @desc    Update a promotion
// @access  Private (Admin only)
router.put('/:id', [auth, admin], async (req, res) => {
  const {
    name,
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
  if (description) promotionFields.description = description;
  if (discountType) promotionFields.discountType = discountType;
  if (discountValue) promotionFields.discountValue = discountValue;
  if (validFrom) promotionFields.validFrom = validFrom;
  if (validTo) promotionFields.validTo = validTo;
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