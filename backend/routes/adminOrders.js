const express = require('express');
const router = express.Router();

const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const adminOnly = require('../middleware/admin');


// ==============================
// GET ALL ORDERS
// ==============================
router.get('/', protect, adminOnly, async (req, res) => {

  const orders = await Order
    .find()
    .populate('user', 'name email');

  res.json({
    success: true,
    orders
  });

});


// ==============================
// UPDATE STATUS
// ==============================
router.put('/:id', protect, adminOnly, async (req, res) => {

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.status = req.body.status;

  await order.save();

  res.json({
    success: true,
    order
  });

});

module.exports = router;
