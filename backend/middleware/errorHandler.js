const { HTTP_STATUS, ERROR_MESSAGES } = require('../constants');

/**
 * Global error handler middleware
 * Ensures all errors are returned in a consistent JSON format
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default values
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
  let errors = err.errors || [];

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = ERROR_MESSAGES.VALIDATION_ERROR;
    
    // Format Mongoose validation errors
    if (err.errors) {
      errors = Object.keys(err.errors).map(field => ({
        field,
        message: err.errors[field].message
      }));
    }
  } else if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    // MongoDB error
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    message = ERROR_MESSAGES.DATABASE_ERROR;
    
    // Handle duplicate key error
    if (err.code === 11000) {
      statusCode = HTTP_STATUS.BAD_REQUEST;
      message = ERROR_MESSAGES.DUPLICATE_KEY;
      
      // Extract field name from error message
      const fieldName = Object.keys(err.keyPattern)[0];
      errors = [{
        field: fieldName,
        message: `The ${fieldName} already exists`
      }];
    }
  } else if (err.name === 'CastError') {
    // Mongoose cast error (usually invalid ObjectId)
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `${ERROR_MESSAGES.INVALID_ID}: ${err.value}`;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    // JWT related errors
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = ERROR_MESSAGES.INVALID_TOKEN;
  } else if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
    // JSON parsing error
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = ERROR_MESSAGES.INVALID_JSON;
  }

  // Return standardized error response
  return res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    errors: errors.length > 0 ? errors : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler; 