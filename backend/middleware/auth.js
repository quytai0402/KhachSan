const jwt = require('jsonwebtoken');
const { ROLES, hasPermission } = require('../utils/roles');

/**
 * Authentication middleware
 * Verifies JWT token and adds user to req object
 */
const auth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user to request object
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

/**
 * Admin role check middleware
 * Requires auth middleware to run first
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === ROLES.ADMIN) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

/**
 * Staff role check middleware
 * Allows both staff and admin roles
 * Requires auth middleware to run first
 */
const staff = (req, res, next) => {
  if (req.user && (req.user.role === ROLES.STAFF || req.user.role === ROLES.ADMIN)) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as staff' });
  }
};

/**
 * Permission-based middleware factory
 * Creates middleware for checking specific permissions
 * @param {string} permission - The permission to check
 * @returns {Function} Middleware function
 */
const checkPermission = (permission) => (req, res, next) => {
  if (req.user && hasPermission(req.user, permission)) {
    next();
  } else {
    res.status(403).json({ 
      message: `Not authorized. Missing permission: ${permission}` 
    });
  }
};

module.exports = { 
  auth, 
  admin, 
  staff, 
  checkPermission 
}; 