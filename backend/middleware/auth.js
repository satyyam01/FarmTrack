const jwt = require('jsonwebtoken');
const User = require('../models/user');

// ✅ JWT Authentication Middleware
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user and ensure active
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (!user.isActive) return res.status(401).json({ error: 'Account is deactivated' });

    // ✅ Attach to req.user with database values (always up-to-date)
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      farm_id: user.farm_id || null
    };

    // 🚫 Enforce farm_id presence for non-admins only
    if (user.role !== 'admin' && !req.user.farm_id) {
      return res.status(403).json({ error: 'User does not belong to any farm' });
    }

    // ✅ Allow admin users to proceed even without farm_id (for farm creation)
    // Non-admin users must have farm_id to proceed
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Authentication error' });
  }
};

// ✅ Role-based Authorization Middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

// ✅ Farm Owner Authorization Middleware
exports.requireFarmOwner = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    // Check if user has a farm_id (is a farm owner)
    if (!req.user.farm_id) {
      return res.status(403).json({ error: 'Farm owner privileges required' });
    }

    next();
  } catch (error) {
    console.error('Farm owner middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
