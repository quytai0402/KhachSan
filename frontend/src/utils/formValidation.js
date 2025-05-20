/**
 * Form validation utility functions
 */

/**
 * Validates a form and returns any validation errors
 * @param {Object} formData - The form data to validate
 * @param {Array} requiredFields - List of required field names
 * @param {Object} customValidations - Custom validation rules for specific fields
 * @returns {Object} Object with validation errors
 */
export const validateForm = (formData, requiredFields = [], customValidations = {}) => {
  const errors = {};
  
  // Check required fields
  requiredFields.forEach(field => {
    if (formData[field] === undefined || formData[field] === null || 
        (typeof formData[field] === 'string' && formData[field].trim() === '') ||
        (Array.isArray(formData[field]) && formData[field].length === 0)) {
      errors[field] = 'Trường này là bắt buộc';
    }
  });
  
  // Apply custom validations
  Object.entries(customValidations).forEach(([field, validationFn]) => {
    if (!errors[field] && formData[field] !== undefined) {
      const validationResult = validationFn(formData[field], formData);
      if (validationResult !== true) {
        errors[field] = validationResult;
      }
    }
  });
  
  return errors;
};

/**
 * Shows validation errors in a toast notification
 * @param {Object} errors - Validation errors object
 * @param {Function} toast - Toast function to display errors
 */
export const displayValidationErrors = (errors, toast) => {
  if (Object.keys(errors).length > 0) {
    const errorMessages = Object.values(errors);
    toast.error(`Vui lòng điền đầy đủ thông tin: ${errorMessages.join(', ')}`);
    return true; // Has errors
  }
  return false; // No errors
};

/**
 * Common validation rules
 */
export const validations = {
  // Email validation
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || 'Email không hợp lệ';
  },
  
  // Phone validation
  phone: (value) => {
    const phoneRegex = /^\d{10,11}$/;
    return phoneRegex.test(value) || 'Số điện thoại không hợp lệ';
  },
  
  // Password validation
  password: (value) => {
    if (value.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    return true;
  },
  
  // Match password validation
  passwordMatch: (confirmValue, formData) => {
    return confirmValue === formData.password || 'Mật khẩu không khớp';
  },
  
  // Price validation
  price: (value) => {
    return (value > 0) || 'Giá phải lớn hơn 0';
  }
};
