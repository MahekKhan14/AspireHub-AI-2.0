const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    next(error);
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!user.isAdmin) {
      // For demo: allow access if email contains 'admin' or is the first user
      const firstUser = await User.findOne().sort({ createdAt: 1 });
      if (!firstUser || firstUser._id.toString() !== user._id.toString()) {
        if (!user.email.includes('admin')) {
          return res.status(403).json({ error: 'Admin access required' });
        }
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate, requireAdmin };
