/**
 * Global error handler middleware
 * Ensures all errors are returned in a consistent JSON format
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = 'Validation Error';
    
    // Format Mongoose validation errors
    if (err.errors) {
      errors = Object.keys(err.errors).map(field => ({
        field,
        message: err.errors[field].message
      }));
    }
  } else if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    // MongoDB error
    statusCode = 500;
    message = 'Database Error';
    
    // Handle duplicate key error
    if (err.code === 11000) {
      statusCode = 400;
      message = 'Duplicate key error';
      
      // Extract field name from error message
      const fieldName = Object.keys(err.keyPattern)[0];
      errors = [{
        field: fieldName,
        message: `The ${fieldName} already exists`
      }];
    }
  } else if (err.name === 'CastError') {
    // Mongoose cast error (usually invalid ObjectId)
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    // JWT related errors
    statusCode = 401;
    message = 'Authentication Error: ' + err.message;
  } else if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
    // JSON parsing error
    statusCode = 400;
    message = 'Invalid JSON in request body';
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