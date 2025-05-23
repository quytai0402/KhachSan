const nodemailer = require('nodemailer');
const { getWelcomeEmailTemplate, getBookingConfirmationTemplate } = require('./emailTemplates');

// Create a transporter object
const createTransporter = () => {
  try {
    // Check if email configuration exists
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_ENABLED === 'false') {
      console.warn('Email configuration missing or disabled. Email functionality disabled.');
      return null;
    }
    
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    return null;
  }
};

// Helper to send email with proper error handling
const sendEmail = async (mailOptions) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      return { success: false, message: 'Email service not configured' };
    }
    
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to send email',
      error 
    };
  }
};

// Send booking confirmation email
const sendBookingConfirmation = async (user, booking, room) => {
  try {
    const transporter = createTransporter();
    if (!transporter) return false;
    
    // Get recipient details
    const recipientName = booking.isGuestBooking ? booking.guestName : user.name;
    const recipientEmail = booking.isGuestBooking ? booking.guestEmail : user.email;
    
    // Generate email content using template
    const htmlContent = getBookingConfirmationTemplate(user, booking, room);
    
    const mailOptions = {
      from: `"Khách sạn của chúng tôi" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Xác nhận đặt phòng #${booking._id.toString().slice(-6).toUpperCase()}`,
      html: htmlContent
    };
    
    const result = await sendEmail(mailOptions);
    return result.success;
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return false;
  }
};

// Send booking cancellation email
const sendBookingCancellation = async (user, booking, room) => {
  try {
    const transporter = createTransporter();
    if (!transporter) return false;
    
    // Get recipient details
    const recipientName = booking.isGuestBooking ? booking.guestName : user.name;
    const recipientEmail = booking.isGuestBooking ? booking.guestEmail : user.email;
    
    const mailOptions = {
      from: `"Khách sạn của chúng tôi" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Hủy đặt phòng #${booking._id.toString().slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
          <div style="background-color: #f44336; color: white; padding: 10px 20px; text-align: center;">
            <h1>Thông báo hủy đặt phòng</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Xin chào ${recipientName},</h2>
            <p>Đặt phòng của bạn đã được hủy thành công. Dưới đây là thông tin chi tiết về đặt phòng đã hủy:</p>
            
            <div style="background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
              <h3>Chi tiết đặt phòng</h3>
              <p><strong>Mã đặt phòng:</strong> ${booking._id.toString().slice(-6).toUpperCase()}</p>
              <p><strong>Loại phòng:</strong> ${room.type?.name || 'Standard'}</p>
              <p><strong>Số phòng:</strong> ${room.roomNumber}</p>
              <p><strong>Ngày nhận phòng:</strong> ${new Date(booking.checkInDate).toLocaleDateString('vi-VN')}</p>
              <p><strong>Ngày trả phòng:</strong> ${new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}</p>
            </div>
            
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
            <p>Chúng tôi hy vọng được phục vụ bạn trong tương lai.</p>
          </div>
          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #888;">
            <p>© ${new Date().getFullYear()} Khách sạn của chúng tôi. Mọi quyền được bảo lưu.</p>
            <p>Địa chỉ: 123 Đường ABC, Thành phố XYZ, Việt Nam</p>
          </div>
        </div>
      `
    };
    
    const result = await sendEmail(mailOptions);
    return result.success;
  } catch (error) {
    console.error('Error sending booking cancellation email:', error);
    return false;
  }
};

// Send welcome email to new user
const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();
    if (!transporter) return false;
    
    // Generate email content using template
    const htmlContent = getWelcomeEmailTemplate(user);
    
    const mailOptions = {
      from: `"Khách sạn của chúng tôi" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Chào mừng bạn đến với Khách sạn của chúng tôi',
      html: htmlContent
    };
    
    const result = await sendEmail(mailOptions);
    return result.success;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

module.exports = {
  sendBookingConfirmation,
  sendBookingCancellation,
  sendWelcomeEmail
};
