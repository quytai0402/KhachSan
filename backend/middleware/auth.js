const jwt = require('jsonwebtoken');
const { USER_ROLES, ERROR_MESSAGES, HTTP_STATUS } = require('../constants');
const { hasPermission } = require('../utils/roles');

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
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
        message: ERROR_MESSAGES.NO_TOKEN 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user to request object
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
      message: ERROR_MESSAGES.INVALID_TOKEN 
    });
  }
};

/**
 * Admin role check middleware
 * Requires auth middleware to run first
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === USER_ROLES.ADMIN) {
    next();
  } else {
    res.status(HTTP_STATUS.FORBIDDEN).json({ 
      message: ERROR_MESSAGES.NOT_ADMIN 
    });
  }
};

/**
 * Staff role check middleware
 * Allows both staff and admin roles
 * Requires auth middleware to run first
 */
const staff = (req, res, next) => {
  if (req.user && (req.user.role === USER_ROLES.STAFF || req.user.role === USER_ROLES.ADMIN)) {
    next();
  } else {
    res.status(HTTP_STATUS.FORBIDDEN).json({ 
      message: ERROR_MESSAGES.NOT_STAFF 
    });
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
    res.status(HTTP_STATUS.FORBIDDEN).json({ 
      message: `${ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS}: ${permission}` 
    });
  }
};

module.exports = { 
  auth, 
  admin, 
  staff, 
  checkPermission 
}; 