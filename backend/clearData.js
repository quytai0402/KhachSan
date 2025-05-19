const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('./models/Room');
const Booking = require('./models/Booking');
const User = require('./models/User');
const Service = require('./models/Service');
const RoomType = require('./models/RoomType');
const Feature = require('./models/Feature');
const Promotion = require('./models/Promotion');

// Load env variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Clear all data except admin user
const clearAllData = async () => {
  try {
    console.log('---- Bắt đầu xóa dữ liệu ----');

    // Xóa tất cả người dùng không phải admin
    const adminResult = await User.deleteMany({ role: { $ne: 'admin' } });
    console.log(`Đã xóa ${adminResult.deletedCount} người dùng không phải admin`);

    // Xóa tất cả các loại dữ liệu khác
    const roomResult = await Room.deleteMany({});
    console.log(`Đã xóa ${roomResult.deletedCount} phòng`);

    const bookingResult = await Booking.deleteMany({});
    console.log(`Đã xóa ${bookingResult.deletedCount} đặt phòng`);

    const serviceResult = await Service.deleteMany({});
    console.log(`Đã xóa ${serviceResult.deletedCount} dịch vụ`);

    const roomTypeResult = await RoomType.deleteMany({});
    console.log(`Đã xóa ${roomTypeResult.deletedCount} loại phòng`);

    const featureResult = await Feature.deleteMany({});
    console.log(`Đã xóa ${featureResult.deletedCount} tiện ích`);

    // Xóa promotions nếu có model
    try {
      const promotionResult = await Promotion.deleteMany({});
      console.log(`Đã xóa ${promotionResult.deletedCount} khuyến mãi`);
    } catch (error) {
      // Nếu model không tồn tại, bỏ qua
      console.log('Không có dữ liệu khuyến mãi để xóa hoặc model không tồn tại');
    }

    console.log('---- Hoàn tất xóa dữ liệu ----');
    console.log('Tài khoản admin vẫn được giữ lại.');

  } catch (error) {
    console.error('Lỗi khi xóa dữ liệu:', error);
  } finally {
    // Đóng kết nối
    await mongoose.disconnect();
    console.log('Đã đóng kết nối MongoDB');
    process.exit(0);
  }
};

// Chạy script
const main = async () => {
  await connectDB();
  await clearAllData();
};

main(); 