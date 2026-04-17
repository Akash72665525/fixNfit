const express = require('express');
const router = express.Router();

const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const adminOnly = require('../middleware/admin');


// ==============================
// CREATE PRODUCT
// ==============================
router.post('/', protect, adminOnly, async (req, res) => {
  try {

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      product
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==============================
// GET ALL PRODUCTS
// ==============================
router.get('/', protect, adminOnly, async (req, res) => {
  try {

    const products = await Product.find();

    res.json({
      success: true,
      products
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==============================
// UPDATE PRODUCT
// ==============================
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      product
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==============================
// DELETE PRODUCT
// ==============================
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted'
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
	