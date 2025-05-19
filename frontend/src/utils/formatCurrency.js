/**
 * Format currency to VND format
 * @param {number} value - The amount to format
 * @param {boolean} showSymbol - Whether to show the VND symbol (default: true)
 * @returns {string} Formatted price in VND
 */
export const formatVND = (value, showSymbol = true) => {
  if (value === undefined || value === null) return '';
  
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(value);
};

/**
 * Vietnamese room type mapping
 * @param {string} type - Room type name in English
 * @returns {string} Vietnamese room type name
 */
export const getVietnameseRoomType = (type) => {
  if (!type) return '';
  
  const typeLower = typeof type === 'string' ? type.toLowerCase() : '';
  
  switch (typeLower) {
    case 'standard':
      return 'Phòng Tiêu Chuẩn';
    case 'deluxe':
      return 'Phòng Cao Cấp';
    case 'suite':
      return 'Phòng Suite';
    case 'family':
      return 'Phòng Gia Đình';
    case 'single':
      return 'Phòng Đơn';
    case 'double':
      return 'Phòng Đôi';
    case 'twin':
      return 'Phòng Twin';
    default:
      // If the type is already an object with a name property, just return it
      return typeof type === 'object' && type.name ? type.name : type;
  }
};
