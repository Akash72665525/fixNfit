const express = require('express');
const router = express.Router();

const User = require('../models/User');
const { protect } = require('../middleware/auth');
const adminOnly = require('../middleware/admin');


// ==============================
// GET ALL USERS
// ==============================
router.get('/', protect, adminOnly, async (req, res) => {

  const users = await User.find().select('-password');

  res.json({
    success: true,
    users
  });

});


// ==============================
// ACTIVATE / DEACTIVATE
// ==============================
router.put('/:id/status', protect, adminOnly, async (req, res) => {

  const user = await User.findById(req.params.id);

  user.isActive = !user.isActive;

  await user.save();

  res.json({
    success: true,
    user
  });

});

module.exports = router;
