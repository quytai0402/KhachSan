// Email Templates Module
const getWelcomeEmailTemplate = (user) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4a90e2; color: white; padding: 10px 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
        .button { display: inline-block; background-color: #4a90e2; color: white; padding: 10px 20px; 
                 text-decoration: none; border-radius: 4px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Chào mừng đến với Khách sạn của chúng tôi!</h1>
        </div>
        <div class="content">
          <h2>Xin chào ${user.name},</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại hệ thống đặt phòng của chúng tôi.</p>
          <p>Với tài khoản này, bạn có thể:</p>
          <ul>
            <li>Đặt phòng dễ dàng và nhanh chóng</li>
            <li>Xem lịch sử đặt phòng của bạn</li>
            <li>Nhận thông báo về các ưu đãi đặc biệt</li>
            <li>Quản lý thông tin cá nhân của bạn</li>
          </ul>
          <p>Hãy khám phá các dịch vụ và tiện nghi của chúng tôi:</p>
          <a href="${process.env.SITE_URL}" class="button">Truy cập trang web</a>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Khách sạn của chúng tôi. Mọi quyền được bảo lưu.</p>
          <p>Địa chỉ: 123 Đường ABC, Thành phố XYZ, Việt Nam</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getBookingConfirmationTemplate = (user, booking, room) => {
  // Format dates
  const checkInDate = new Date(booking.checkInDate);
  const checkOutDate = new Date(booking.checkOutDate);
  const formattedCheckIn = checkInDate.toLocaleDateString('vi-VN', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });
  const formattedCheckOut = checkOutDate.toLocaleDateString('vi-VN', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4a90e2; color: white; padding: 10px 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .booking-details { background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
        .button { display: inline-block; background-color: #4a90e2; color: white; padding: 10px 20px; 
                 text-decoration: none; border-radius: 4px; margin-top: 15px; }
        .price { font-size: 18px; font-weight: bold; color: #4a90e2; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Xác nhận đặt phòng</h1>
        </div>
        <div class="content">
          <h2>Xin chào ${user.name || booking.guestName},</h2>
          <p>Cảm ơn bạn đã đặt phòng tại khách sạn của chúng tôi. Dưới đây là thông tin chi tiết về đặt phòng của bạn:</p>
          
          <div class="booking-details">
            <h3>Chi tiết đặt phòng</h3>
            <p><strong>Mã đặt phòng:</strong> ${booking._id.toString().slice(-6).toUpperCase()}</p>
            <p><strong>Loại phòng:</strong> ${room.type?.name || 'Standard'}</p>
            <p><strong>Số phòng:</strong> ${room.roomNumber}</p>
            <p><strong>Ngày nhận phòng:</strong> ${formattedCheckIn}</p>
            <p><strong>Ngày trả phòng:</strong> ${formattedCheckOut}</p>
            <p><strong>Số khách:</strong> ${booking.numberOfGuests.adults} người lớn, ${booking.numberOfGuests.children} trẻ em</p>
            <p><strong>Tổng giá:</strong> <span class="price">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalPrice)}</span></p>
          </div>
          
          <p>Vui lòng kiểm tra thông tin đặt phòng và liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi nào.</p>
          <p>Bạn có thể xem chi tiết đặt phòng của mình trên trang web của chúng tôi:</p>
          <a href="${process.env.SITE_URL}/bookings/${booking._id}" class="button">Xem đặt phòng</a>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Khách sạn của chúng tôi. Mọi quyền được bảo lưu.</p>
          <p>Địa chỉ: 123 Đường ABC, Thành phố XYZ, Việt Nam</p>
          <p>Điện thoại: +84 XXX XXX XXX | Email: info@khachsan.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  getWelcomeEmailTemplate,
  getBookingConfirmationTemplate
};
