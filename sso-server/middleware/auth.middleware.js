const { verifyToken } = require('../utils/jwt.utils');
const User = require('../models/user.model');

// Middleware to verify JWT token
const verifyJWT = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.accessToken;
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Set user in request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  verifyJWT
}; 