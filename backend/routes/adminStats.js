const express = require('express');
const router = express.Router();

const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

const { protect } = require('../middleware/auth');
const adminOnly = require('../middleware/admin');


router.get('/', protect, adminOnly, async (req, res) => {

  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  const revenue = await Order.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: '$totalPrice' }
      }
    }
  ]);

  res.json({
    success: true,

    stats: {
      users: totalUsers,
      products: totalProducts,
      orders: totalOrders,
      revenue: revenue[0]?.total || 0
    }
  });

});

module.exports = router;
