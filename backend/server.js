const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/error');

// Load environment variables FIRST
dotenv.config();

// Initialize app
const app = express();

// Connect to database
connectDB();

// Ensure product indexes (creates text index if missing) to support search relevance
try {
  const Product = require('./models/Product');
  (async () => {
    try {
      await Product.syncIndexes();
      console.log('✅ Product indexes are synchronized (ProductTextIndex will be created if missing)');
    } catch (err) {
      console.warn('⚠ Failed to sync Product indexes:', err.message || err);
    }
  })();
} catch (err) {
  console.warn('⚠ Could not require Product model to sync indexes:', err.message || err);
}

// Middleware
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ignore favicon and manifest requests (common browser requests that aren't API calls)
app.get('/favicon.ico', (req, res) => res.status(204).send());
app.get('/manifest.json', (req, res) => res.status(204).send());

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// -------------------- ROUTES --------------------

// Core routes (always enabled)
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Payment routes (OPTIONAL – Razorpay)
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  const paymentRoutes = require('./routes/payment');
  app.use('/api/payment', paymentRoutes);
  console.log('💳 Razorpay payments ENABLED');
} else {
  console.log('⚠ Razorpay not configured. Payment APIs DISABLED');
}

// -------------------- BASIC ROUTES --------------------

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: '✨ Welcome to FixNFit Co. API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      users: '/api/users',
      payment: process.env.RAZORPAY_KEY_ID ? '/api/payment' : 'disabled'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// -------------------- ERROR HANDLING --------------------

app.use(notFound);
app.use(errorHandler);

// -------------------- SERVER START --------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 FixNFit Co. Backend Server       ║
║   📍 Running on port ${PORT}             ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}        ║
╚════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  process.exit(1);
});
