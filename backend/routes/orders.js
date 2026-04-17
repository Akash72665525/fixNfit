const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { protect, adminOnly } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentDetails, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided'
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide shipping address'
      });
    }

    // Calculate order totals and validate stock
    let subtotal = 0;
    const orderItems = [];

    for (let item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is not available`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} items available.`
        });
      }

      subtotal += product.price * item.quantity;
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
        image: product.images[0] || '',
        sku: product.sku
      });
    }

    // Calculate shipping (free above 500)
    const shippingCost = subtotal >= 500 ? 0 : 50;
    
    // Calculate tax (18% GST)
    const tax = Math.round(subtotal * 0.18);
    
    // Calculate total
    const total = subtotal + shippingCost + tax;

    // Set payment status based on method
    const paymentStatus = paymentMethod === 'cod' ? 'pending' : 
                         paymentDetails?.status || 'pending';

    // Generate unique order number: ORD-TIMESTAMP-RANDOM
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      paymentDetails,
      subtotal,
      shippingCost,
      tax,
      total,
      notes,
      orderStatus: paymentStatus === 'completed' ? 'confirmed' : 'pending',
      statusHistory: [{
        status: paymentStatus === 'completed' ? 'confirmed' : 'pending',
        timestamp: new Date(),
        note: 'Order created'
      }]
    });

    // Update product stock
    for (let item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Add order to user's orders
    await User.findByIdAndUpdate(req.user._id, {
      $push: { orders: order._id }
    });

    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name images')
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get logged in user orders
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = { user: req.user._id };
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name images')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images sku');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Make sure order belongs to user (unless admin)
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
});

// @route   GET /api/orders/:id/invoice
// @desc    Generate and return an invoice (HTML) for download
// @access  Private
router.get('/:id/invoice', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    // Generate PDF invoice using PDFKit and stream to response
    const filename = `invoice-${order.orderNumber}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    // Try to use an embedded font that supports the rupee glyph (₹).
    // Place a TTF at backend/fonts/NotoSans-Regular.ttf to enable ₹. Otherwise fallback to 'Rs'.
    const fontsDir = path.join(__dirname, '..', 'fonts');
    const notoPath = path.join(fontsDir, 'NotoSans-Regular.ttf');
    const currencySymbol = fs.existsSync(notoPath) ? '₹' : 'Rs';
    if (fs.existsSync(notoPath)) {
      try {
        doc.registerFont('Noto', notoPath);
        doc.font('Noto');
      } catch (e) {
        console.warn('Failed to register font at', notoPath, e.message);
      }
    } else {
      console.warn('Font for rupee glyph not found at', notoPath, '- using Rs fallback');
    }

    // Header
    doc.fontSize(20).fillColor('#333').text('FixNFit Co.', { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Invoice: ${order.orderNumber}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
    doc.moveDown(0.5);

    // Billing
    doc.fontSize(14).text('Billing To', { underline: true });
    doc.moveDown(0.2);
    doc.fontSize(12).text(order.user.name || '');
    if (order.user.email) doc.text(order.user.email);
    if (order.user.phone) doc.text(order.user.phone);
    doc.moveDown(0.5);

    // Table header
    const tableTop = doc.y + 10;
    const itemX = 50;
    const qtyX = 320;
    const priceX = 380;
    const subtotalX = 450;

    doc.fontSize(12).text('Item', itemX, tableTop);
    doc.text('Qty', qtyX, tableTop);
    doc.text('Price', priceX, tableTop);
    doc.text('Subtotal', subtotalX, tableTop, { align: 'right' });

    let y = tableTop + 20;
    for (let it of order.items) {
      const name = it.name || (it.product && it.product.name) || 'Product';
      const qty = it.quantity || 1;
      const price = Number(it.price || (it.product && it.product.price) || 0);
      const lineTotal = qty * price;

      doc.text(name, itemX, y);
      doc.text(String(qty), qtyX, y);
      doc.text(`${currencySymbol} ${price.toFixed(2)}`, priceX, y);
      doc.text(`${currencySymbol} ${lineTotal.toFixed(2)}`, subtotalX, y, { align: 'right' });

      y += 20;
      if (y > 720) { doc.addPage(); y = 50; }
    }

    // Totals
    y += 10;
    doc.text(`Subtotal: ${currencySymbol} ${Number(order.subtotal || 0).toFixed(2)}`, subtotalX - 120, y, { align: 'left' });
    y += 15;
    doc.text(`Shipping: ${currencySymbol} ${Number(order.shippingCost || 0).toFixed(2)}`, subtotalX - 120, y, { align: 'left' });
    y += 15;
    doc.text(`Tax: ${currencySymbol} ${Number(order.tax || 0).toFixed(2)}`, subtotalX - 120, y, { align: 'left' });
    y += 15;
    // Use the registered font for bold text where possible
    try { doc.font(fs.existsSync(notoPath) ? 'Noto' : 'Helvetica-Bold'); } catch (e) { /* ignore */ }
    doc.text(`Total: ${currencySymbol} ${Number(order.total || 0).toFixed(2)}`, subtotalX - 120, y, { align: 'left' });

    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica').fillColor('#666').text('Thank you for shopping at FixNFit.', { align: 'left' });

    doc.end();
  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({ success: false, message: 'Error generating invoice' });
  }
});

// @route   GET /api/orders
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, sortBy = '-createdAt' } = req.query;
    
    let query = {};
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name')
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments(query);

    // Calculate statistics
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private/Admin
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, note, trackingNumber, estimatedDelivery } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide order status'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      note,
      timestamp: Date.now(),
      updatedBy: req.user._id
    });

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (estimatedDelivery) {
      order.estimatedDelivery = estimatedDelivery;
    }

    if (status === 'delivered') {
      order.deliveredAt = Date.now();
    }

    if (status === 'cancelled') {
      order.cancelledAt = Date.now();
      order.cancellationReason = note;
      
      // Restore product stock
      for (let item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
});

// @route   PUT /api/orders/:id/payment
// @desc    Update payment status
// @access  Private
router.put('/:id/payment', protect, async (req, res) => {
  try {
    const { paymentStatus, paymentDetails } = req.body;
    
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify order belongs to user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    order.paymentStatus = paymentStatus;
    
    if (paymentDetails) {
      order.paymentDetails = { 
        ...order.paymentDetails.toObject(), 
        ...paymentDetails,
        paidAt: paymentStatus === 'completed' ? new Date() : order.paymentDetails.paidAt
      };
    }

    if (paymentStatus === 'completed' && order.orderStatus === 'pending') {
      order.orderStatus = 'confirmed';
      order.statusHistory.push({
        status: 'confirmed',
        timestamp: Date.now(),
        note: 'Payment received'
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment status',
      error: error.message
    });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Cancel order
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify order belongs to user or user is admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    order.orderStatus = 'cancelled';
    order.cancelledAt = Date.now();
    order.cancellationReason = req.body.reason || 'Cancelled by customer';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: Date.now(),
      note: order.cancellationReason
    });

    // Restore product stock
    for (let item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
});

module.exports = router;
