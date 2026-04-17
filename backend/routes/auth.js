const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PasswordResetLog = require('../models/PasswordResetLog');
const { protect } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../services/emailService');
const { sendOtpEmail, sendOtpSms } = require('../services/emailService');

// =============================
// OTP Storage (In-memory - use Redis in production)
// =============================
const otpStore = new Map();

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const storeOtp = (key, otp) => {
  otpStore.set(key, {
    otp,
    timestamp: Date.now(),
    attempts: 0
  });
  // Clear OTP after 10 minutes
  setTimeout(() => otpStore.delete(key), 10 * 60 * 1000);
};

const verifyOtpAndClear = (key, otp) => {
  const stored = otpStore.get(key);
  if (!stored) return false;
  
  // Check if OTP expired (10 minutes)
  if (Date.now() - stored.timestamp > 10 * 60 * 1000) {
    otpStore.delete(key);
    return false;
  }
  
  // Check if too many attempts (3 attempts max)
  if (stored.attempts >= 3) {
    otpStore.delete(key);
    return false;
  }
  
  if (stored.otp !== otp) {
    stored.attempts++;
    return false;
  }
  
  otpStore.delete(key);
  return true;
};

// =============================
// Generate JWT
// =============================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// =============================
// @route   POST /api/auth/register
// =============================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    res.status(500).json({
      success: false,
      message: 'Error registering user'
    });
  }
});

// =============================
// @route   POST /api/auth/login
// =============================
router.post('/login', async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User
      .findOne({ email })
      .select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      success: false,
      message: 'Error logging in'
    });
  }
});

// =============================
// @route   GET /api/auth/me
// =============================
router.get('/me', protect, async (req, res) => {
  try {

    const user = await User
      .findById(req.user.id)
      .select('-password')
      .populate('orders');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 🔥 SAME FORMAT AS LOGIN
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        orders: user.orders
      }
    });

  } catch (error) {
    console.error('Get user error:', error);

    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
});

// =============================
// @route   PUT /api/auth/update-password
// =============================
router.put('/update-password', protect, async (req, res) => {
  try {

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Provide both passwords'
      });
    }

    const user = await User
      .findById(req.user.id)
      .select('+password');

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password updated',
      token
    });

  } catch (error) {
    console.error('Update password error:', error);

    res.status(500).json({
      success: false,
      message: 'Error updating password'
    });
  }
});

// =============================
// @route   POST /api/auth/send-email-otp
// @desc    Send OTP to email
// @access  Public
// =============================
router.post('/send-email-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Generate and store OTP
    const otp = generateOtp();
    storeOtp(`email_${email}`, otp);

    // Send email with OTP
    console.log(`\n📧 Sending email OTP to ${email}...`);
    await sendOtpEmail(email, otp);
    console.log(`✅ OTP sent successfully to ${email}\n`);

    res.json({
      success: true,
      message: 'OTP sent to email'
    });
  } catch (error) {
    console.error('Send email OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP'
    });
  }
});

// =============================
// @route   POST /api/auth/verify-email-otp
// @desc    Verify OTP for email
// @access  Public
// =============================
router.post('/verify-email-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Verify OTP
    if (!verifyOtpAndClear(`email_${email}`, otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    res.json({
      success: true,
      message: 'Email verified'
    });
  } catch (error) {
    console.error('Verify email OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP'
    });
  }
});

// =============================
// @route   POST /api/auth/send-phone-otp
// @desc    Send OTP to phone
// @access  Public
// =============================
router.post('/send-phone-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone number'
      });
    }

    // Check if phone already registered
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered'
      });
    }

    // Generate and store OTP
    const otp = generateOtp();
    storeOtp(`phone_${phone}`, otp);

    // Send SMS with OTP (attempt via provider, fallback to console)
    console.log(`\n📱 Sending SMS OTP to ${phone}...`);
    const smsResult = await sendOtpSms(phone, otp);
    console.log(`📱 sendOtpSms result for ${phone}:`, smsResult);

    if (!smsResult) {
      console.warn(`⚠️ SMS provider failed for ${phone}; OTP logged to server console instead.`);
      return res.status(500).json({
        success: false,
        message: 'Failed to send SMS OTP via provider; check server logs for the OTP'
      });
    }

    console.log(`✅ OTP sent successfully to ${phone}\n`);

    res.json({
      success: true,
      message: 'OTP sent to phone'
    });
  } catch (error) {
    console.error('Send phone OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP'
    });
  }
});

// =============================
// @route   POST /api/auth/verify-phone-otp
// @desc    Verify OTP for phone
// @access  Public
// =============================
router.post('/verify-phone-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone and OTP'
      });
    }

    // Verify OTP
    if (!verifyOtpAndClear(`phone_${phone}`, otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    res.json({
      success: true,
      message: 'Phone verified'
    });
  } catch (error) {
    console.error('Verify phone OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP'
    });
  }
});

// =============================
// @route   POST /api/auth/forgot-password
// @desc    Send password reset link to email
// @access  Public
// =============================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email not registered. Please create an account first.',
        notRegistered: true,
        email: email
      });
    }

    // Only allow customers to reset password, not admins
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot use this feature'
      });
    }

    // =============================
    // RATE LIMITING CHECKS
    // =============================

    // Check 1: Is there an active (non-expired) reset link?
    const activeResetLink = await PasswordResetLog.findOne({
      email: email.toLowerCase(),
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (activeResetLink) {
      return res.status(429).json({
        success: false,
        message: 'A password reset link has already been sent to this email. Please check your inbox and spam folder. The link will expire in 10 minutes.',
        rateLimited: true,
        type: 'active_link_exists'
      });
    }

    // Check 2: How many reset requests in the last 24 hours?
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const requestsInLast24Hours = await PasswordResetLog.countDocuments({
      email: email.toLowerCase(),
      createdAt: { $gte: twentyFourHoursAgo }
    });

    if (requestsInLast24Hours >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Too many password reset requests. You have reached the limit of 3 requests per day. Please try again tomorrow.',
        rateLimited: true,
        type: 'daily_limit_exceeded',
        requestsUsed: requestsInLast24Hours,
        requestsLimit: 3
      });
    }

    // =============================
    // GENERATE AND SEND RESET LINK
    // =============================

    // Generate reset token (valid for 10 minutes)
    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Log the reset request
    await PasswordResetLog.create({
      email: email.toLowerCase(),
      token: resetToken,
      expiresAt: expiresAt
    });

    // Send password reset email with link
    console.log(`\n📧 Sending password reset email to ${email}...`);
    const emailSent = await sendPasswordResetEmail(email, resetToken);
    
    if (!emailSent) {
      console.warn(`⚠️ Failed to send password reset email to ${email}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset link. Please try again later.'
      });
    }

    console.log(`✅ Password reset email sent to ${email}`);
    console.log(`📝 Reset requests today: ${requestsInLast24Hours + 1}/3`);

    // Respond with success
    res.status(200).json({
      success: true,
      message: 'Password reset link has been sent to your registered email. Please check your inbox and spam folder. The link will expire in 10 minutes.',
      requestsUsed: requestsInLast24Hours + 1,
      requestsLimit: 3
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending reset link'
    });
  }
});

// =============================
// @route   POST /api/auth/validate-reset-token
// @desc    Validate reset token and get remaining time
// @access  Public
// =============================
router.post('/validate-reset-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    // Verify token and get expiration info
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({
          success: false,
          message: 'Reset link has expired. Please request a new one.',
          expired: true
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid reset link',
        expired: true
      });
    }

    // Token is valid - calculate remaining time
    // JWT tokens have 'exp' claim (expiration time in seconds since epoch)
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingSeconds = decoded.exp - currentTime;

    if (remainingSeconds <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Reset link has expired. Please request a new one.',
        expired: true
      });
    }

    res.status(200).json({
      success: true,
      valid: true,
      remainingSeconds: remainingSeconds,
      message: 'Token is valid'
    });

  } catch (error) {
    console.error('Validate reset token error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating token'
    });
  }
});

// =============================
// @route   POST /api/auth/reset-password
// @desc    Reset password using token
// @access  Public
// =============================
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({
          success: false,
          message: 'Reset link has expired. Please request a new one.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid reset link'
      });
    }

    // Find user and update password
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Mark the reset token as used
    await PasswordResetLog.updateOne(
      { token: token },
      { 
        isUsed: true,
        usedAt: new Date()
      }
    );

    console.log(`✅ Password reset successfully for ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
});

module.exports = router;
