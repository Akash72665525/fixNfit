const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');


// ============================
// ADMIN MIDDLEWARE
// ============================
const adminOnly = async (req, res, next) => {
  try {

    const user = await User.findById(req.user.id);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access only'
      });
    }

    next();

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Admin auth failed'
    });
  }
};


// ============================
// DASHBOARD STATS
// ============================
router.get('/stats', protect, adminOnly, async (req, res) => {

  try {

    const users = await User.countDocuments();
    const products = await Product.countDocuments();
    const orders = await Order.countDocuments();

    // Calculate revenue from delivered orders (actual revenue)
    const revenue = await Order.aggregate([
      {
        $match: { orderStatus: 'delivered' }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    res.json({
      success: true,

      stats: {
        users,
        products,
        orders,
        revenue: revenue[0]?.total || 0
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ============================
// PRODUCT MANAGER
// ============================

// Get all products
router.get('/products', protect, adminOnly, async (req, res) => {

  const products = await Product.find();

  res.json({
    success: true,
    products
  });

});

// Create product
router.post('/products', protect, adminOnly, async (req, res) => {

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product
  });

});

// Update product
router.put('/products/:id', protect, adminOnly, async (req, res) => {

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json({
    success: true,
    product
  });

});

// Delete product
router.delete('/products/:id', protect, adminOnly, async (req, res) => {

  await Product.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Product deleted'
  });

});


// ============================
// ORDER MANAGER
// ============================

// Get all orders
router.get('/orders', protect, adminOnly, async (req, res) => {

  const orders = await Order
    .find()
    .populate('user', 'name email');

  res.json({
    success: true,
    orders
  });

});

// Update order status
router.put('/orders/:id', protect, adminOnly, async (req, res) => {

  try {
    console.log(`📋 Updating order ${req.params.id} with status:`, req.body.orderStatus);
    
    const order = await Order.findById(req.params.id);

    if (!order) {
      console.log(`❌ Order ${req.params.id} not found`);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log(`📌 Current order status:`, order.orderStatus);
    console.log(`📌 Current statusHistory:`, order.statusHistory);

    // Update order status
    const newStatus = req.body.orderStatus || req.body.status;
    
    if (!newStatus) {
      console.log(`❌ No status provided in request`);
      return res.status(400).json({
        success: false,
        message: 'No status provided'
      });
    }
    
    if (newStatus === order.orderStatus) {
      console.log(`ℹ️ Status unchanged (${newStatus})`);
      return res.json({
        success: true,
        order
      });
    }

    // Use findByIdAndUpdate with $set to bypass validation issues with existing malformed data
    console.log(`✅ Status changed from ${order.orderStatus} to ${newStatus}`);
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          orderStatus: newStatus,
          updatedAt: new Date()
        },
        $push: {
          statusHistory: {
            status: newStatus,
            timestamp: new Date(),
            note: req.body.note || 'Status updated',
            updatedBy: req.user._id
          }
        }
      },
      { new: true, runValidators: false } // Skip validation to bypass malformed data
    );

    console.log(`✅ Order updated successfully`);

    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (err) {
    console.error('❌ Order update error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: err.message
    });
  }

});


// ============================
// USER MANAGER
// ============================

// Get all users
router.get('/users', protect, adminOnly, async (req, res) => {

  const users = await User.find().select('-password');

  res.json({
    success: true,
    users
  });

});

// Activate / Deactivate user
router.put('/users/:id/status', protect, adminOnly, async (req, res) => {

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  user.isActive = !user.isActive;

  await user.save();

  res.json({
    success: true,
    user
  });

});

// Delete user
router.delete('/users/:id', protect, adminOnly, async (req, res) => {

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'User deleted'
  });

});


module.exports = router;
