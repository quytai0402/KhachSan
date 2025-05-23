/**
 * Async handler wrapper for Express route handlers
 * Catches any errors and forwards them to the error handling middleware
 * 
 * @param {Function} fn - The async route handler function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler; 