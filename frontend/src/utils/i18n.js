/**
 * Tiện ích đa ngôn ngữ đơn giản cho ứng dụng
 */

// Từ điển tiếng Việt cho các chuỗi thường gặp trong ứng dụng
const vietnameseTranslations = {
  // Chung
  'Cancel': 'Hủy',
  'Save': 'Lưu',
  'Edit': 'Chỉnh sửa',
  'Delete': 'Xóa',
  'Add': 'Thêm',
  'Create': 'Tạo mới',
  'Update': 'Cập nhật',
  'Submit': 'Gửi',
  'Search': 'Tìm kiếm',
  'Filter': 'Lọc',
  'Status': 'Trạng thái',
  'Actions': 'Thao tác',
  'Details': 'Chi tiết',
  'Back': 'Quay lại',
  'Next': 'Tiếp theo',
  'Previous': 'Trước đó',
  'Done': 'Hoàn thành',

  // Phòng
  'Available': 'Còn trống',
  'Booked': 'Đã đặt',
  'Maintenance': 'Bảo trì',
  'Room Management': 'Quản lý phòng',
  'Add Room': 'Thêm phòng',
  'Edit Room': 'Chỉnh sửa phòng',
  'Delete Room': 'Xóa phòng',
  'Room Number': 'Số phòng',
  'Room Details': 'Chi tiết phòng',
  'Price per Night': 'Giá mỗi đêm',
  'Floor': 'Tầng',
  'Capacity': 'Sức chứa',
  'Amenities': 'Tiện nghi',
  'Description': 'Mô tả',
  'Images': 'Hình ảnh',
  'Upload Images': 'Tải lên hình ảnh',
  'Select Room Type': 'Chọn loại phòng',
  'Select Room Status': 'Chọn trạng thái phòng',
  'Confirm Delete Room': 'Bạn có chắc chắn muốn xóa phòng %{roomNumber}? Hành động này không thể hoàn tác.',
  'No Rooms Found': 'Không tìm thấy phòng nào',

  // Đặt phòng
  'Booking': 'Đặt phòng',
  'Bookings': 'Đặt phòng',
  'Booking Management': 'Quản lý đặt phòng',
  'Add Booking': 'Thêm đặt phòng',
  'Edit Booking': 'Chỉnh sửa đặt phòng',
  'Delete Booking': 'Xóa đặt phòng',
  'Booking Details': 'Chi tiết đặt phòng',
  'Check-in': 'Nhận phòng',
  'Check-out': 'Trả phòng',
  'Booking Date': 'Ngày đặt',
  'Guest': 'Khách',
  'Guest Information': 'Thông tin khách hàng',
  'Special Requests': 'Yêu cầu đặc biệt',
  'Booking Status': 'Trạng thái đặt phòng',
  'Payment Status': 'Trạng thái thanh toán',
  
  // Khuyến mãi
  'Promotion': 'Khuyến mãi',
  'Promotions': 'Khuyến mãi',
  'Promotion Management': 'Quản lý khuyến mãi',
  'Add Promotion': 'Thêm khuyến mãi',
  'Edit Promotion': 'Chỉnh sửa khuyến mãi',
  'Delete Promotion': 'Xóa khuyến mãi',
  'Promotion Details': 'Chi tiết khuyến mãi',
  'Discount': 'Giảm giá',
  'Valid Until': 'Có hiệu lực đến',
  'Promo Code': 'Mã khuyến mãi',

  // Người dùng
  'User': 'Người dùng',
  'Users': 'Người dùng',
  'User Management': 'Quản lý người dùng',
  'Add User': 'Thêm người dùng',
  'Edit User': 'Chỉnh sửa người dùng',
  'Delete User': 'Xóa người dùng',
  'User Details': 'Chi tiết người dùng',
  'Role': 'Vai trò',
  'Admin': 'Quản trị viên',
  'Staff': 'Nhân viên',
  'Customer': 'Khách hàng',

  // Dịch vụ
  'Service': 'Dịch vụ',
  'Services': 'Dịch vụ',
  'Service Management': 'Quản lý dịch vụ',
  'Add Service': 'Thêm dịch vụ',
  'Edit Service': 'Chỉnh sửa dịch vụ',
  'Delete Service': 'Xóa dịch vụ',
  'Service Details': 'Chi tiết dịch vụ',
  'Service Title': 'Tiêu đề dịch vụ',
  'Icon Name': 'Tên biểu tượng',
  'Image URL': 'URL hình ảnh',
  'Icon Helper': 'VD: SpaOutlined, RestaurantOutlined',
  'Image URL Helper': 'Nhập URL hình ảnh hợp lệ',
  'Active': 'Hoạt động',
  'Inactive': 'Không hoạt động',
  'No Services Found': 'Không tìm thấy dịch vụ nào',
  'Refresh': 'Làm mới',
  'Add Service': 'Thêm dịch vụ',
  'Edit Service': 'Chỉnh sửa dịch vụ',
  'Update Service': 'Cập nhật dịch vụ',
  'Delete Service': 'Xóa dịch vụ',
  'Confirm Delete Service': 'Bạn có chắc chắn muốn xóa dịch vụ "%{title}"? Hành động này không thể hoàn tác.'
};

/**
 * Dịch một chuỗi sang tiếng Việt
 * @param {string} text Chuỗi cần dịch
 * @param {Object} params Các tham số để thay thế trong chuỗi
 * @returns {string} Chuỗi đã dịch hoặc chuỗi gốc nếu không tìm thấy bản dịch
 */
export const translate = (text, params = {}) => {
  let translated = vietnameseTranslations[text] || text;
  
  // Thay thế các tham số trong chuỗi, ví dụ: %{name} => "John"
  if (params && Object.keys(params).length > 0) {
    Object.keys(params).forEach(key => {
      translated = translated.replace(new RegExp(`%{${key}}`, 'g'), params[key]);
    });
  }
  
  return translated;
};

export default {
  translate
};
