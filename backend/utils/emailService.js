const nodemailer = require('nodemailer');

// Create a transporter object
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send booking confirmation email
const sendBookingConfirmation = async (user, booking, room) => {
  try {
    const transporter = createTransporter();
    
    // Format dates
    const checkInDate = new Date(booking.checkInDate).toLocaleDateString();
    const checkOutDate = new Date(booking.checkOutDate).toLocaleDateString();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Booking Confirmation - Hotel Management',
      html: `
        <h2>Booking Confirmation</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for your booking at our hotel. Below are your booking details:</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="border: 1px solid #dddddd; padding: 8px;"><strong>Booking ID</strong></td>
            <td style="border: 1px solid #dddddd; padding: 8px;">${booking._id}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #dddddd; padding: 8px;"><strong>Room</strong></td>
            <td style="border: 1px solid #dddddd; padding: 8px;">${room.roomNumber} (${room.type})</td>
          </tr>
          <tr>
            <td style="border: 1px solid #dddddd; padding: 8px;"><strong>Check-in Date</strong></td>
            <td style="border: 1px solid #dddddd; padding: 8px;">${checkInDate}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #dddddd; padding: 8px;"><strong>Check-out Date</strong></td>
            <td style="border: 1px solid #dddddd; padding: 8px;">${checkOutDate}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #dddddd; padding: 8px;"><strong>Guests</strong></td>
            <td style="border: 1px solid #dddddd; padding: 8px;">${booking.numberOfGuests.adults} Adults, ${booking.numberOfGuests.children} Children</td>
          </tr>
          <tr>
            <td style="border: 1px solid #dddddd; padding: 8px;"><strong>Total Amount</strong></td>
            <td style="border: 1px solid #dddddd; padding: 8px;">$${booking.totalPrice}</td>
          </tr>
        </table>
        <p>If you have any questions or need to make changes to your booking, please contact us.</p>
        <p>We look forward to welcoming you to our hotel!</p>
        <p>Best regards,<br>Hotel Management Team</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return false;
  }
};

// Send booking cancellation email
const sendBookingCancellation = async (user, booking, room) => {
  try {
    const transporter = createTransporter();
    
    // Format dates
    const checkInDate = new Date(booking.checkInDate).toLocaleDateString();
    const checkOutDate = new Date(booking.checkOutDate).toLocaleDateString();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Booking Cancellation - Hotel Management',
      html: `
        <h2>Booking Cancellation</h2>
        <p>Dear ${user.name},</p>
        <p>Your booking has been cancelled as requested. Below are the details of the cancelled booking:</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="border: 1px solid #dddddd; padding: 8px;"><strong>Booking ID</strong></td>
            <td style="border: 1px solid #dddddd; padding: 8px;">${booking._id}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #dddddd; padding: 8px;"><strong>Room</strong></td>
            <td style="border: 1px solid #dddddd; padding: 8px;">${room.roomNumber} (${room.type})</td>
          </tr>
          <tr>
            <td style="border: 1px solid #dddddd; padding: 8px;"><strong>Check-in Date</strong></td>
            <td style="border: 1px solid #dddddd; padding: 8px;">${checkInDate}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #dddddd; padding: 8px;"><strong>Check-out Date</strong></td>
            <td style="border: 1px solid #dddddd; padding: 8px;">${checkOutDate}</td>
          </tr>
        </table>
        <p>If you have any questions, please contact us.</p>
        <p>We hope to welcome you to our hotel in the future.</p>
        <p>Best regards,<br>Hotel Management Team</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Booking cancellation email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending booking cancellation email:', error);
    return false;
  }
};

// Send welcome email when a user registers
const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Welcome to Hotel Management',
      html: `
        <h2>Welcome to Hotel Management</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for registering with us. We're excited to have you as a member!</p>
        <p>With your account, you can:</p>
        <ul>
          <li>Book rooms easily</li>
          <li>View and manage your bookings</li>
          <li>Access exclusive promotions and offers</li>
          <li>Save your preferences for future stays</li>
        </ul>
        <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
        <p>Best regards,<br>Hotel Management Team</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${user.email}`);
    return true;
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