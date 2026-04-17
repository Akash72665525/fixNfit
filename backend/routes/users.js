const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('orders');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
});

// @route   PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({ success: true, message: 'Profile updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
  }
});

// @route   GET /api/users/cart
router.get('/cart', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    console.log('Cart data:', user.cart);
    res.status(200).json({ success: true, data: user.cart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ success: false, message: 'Error fetching cart', error: error.message });
  }
});

// @route   POST /api/users/cart
router.post('/cart', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }
    
    const user = await User.findById(req.user._id);
    
    const existingItem = user.cart.find(item => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }
    
    await user.save();
    const updatedUser = await User.findById(req.user._id).populate('cart.product');
    res.status(200).json({ success: true, message: 'Item added to cart', data: updatedUser.cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Error adding to cart', error: error.message });
  }
});

// @route   PUT /api/users/cart/:productId
router.put('/cart/:productId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }
    
    const user = await User.findById(req.user._id);
    // Cart items have _id as product ID directly
    const cartItem = user.cart.find(item => item._id?.toString() === req.params.productId || item.product?.toString() === req.params.productId);
    
    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }
    
    cartItem.quantity = quantity;
    await user.save();
    const updatedUser = await User.findById(req.user._id).populate('cart.product');
    res.status(200).json({ success: true, data: updatedUser.cart });
  } catch (error) {
    console.error('Cart update error:', error);
    res.status(500).json({ success: false, message: 'Error updating cart', error: error.message });
  }
});

// @route   DELETE /api/users/cart/:productId
router.delete('/cart/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Cart items have _id as product ID directly
    const itemExists = user.cart.some(item => item._id?.toString() === req.params.productId || item.product?.toString() === req.params.productId);
    if (!itemExists) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }
    
    user.cart = user.cart.filter(item => {
      return item._id?.toString() !== req.params.productId && item.product?.toString() !== req.params.productId;
    });
    await user.save();
    const updatedUser = await User.findById(req.user._id).populate('cart.product');
    res.status(200).json({ success: true, message: 'Item removed', data: updatedUser.cart });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, message: 'Error removing from cart', error: error.message });
  }
});

// @route   DELETE /api/users/cart (Clear cart)
router.delete('/cart', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { cart: [] });
    res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error clearing cart', error: error.message });
  }
});

// @route   GET /api/users (Admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
  }
});

module.exports = router;
