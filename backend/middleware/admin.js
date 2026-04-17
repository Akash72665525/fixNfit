const User = require('../models/User');

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

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authorization failed'
    });
  }
};

module.exports = adminOnly;
