const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

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

// Create default users
const createDefaultUsers = async () => {
  try {
    console.log('---- Tạo các tài khoản mặc định ----');
    
    // Tạo mật khẩu mã hóa
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash('admin', salt);
    const hashedStaffPassword = await bcrypt.hash('staff123', salt);
    const hashedUserPassword = await bcrypt.hash('user123', salt);
    
    // Tạo tài khoản admin nếu chưa có
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = new User({
        name: 'Administrator',
        email: 'admin',
        password: hashedAdminPassword,
        role: 'admin',
        isActive: true
      });
      await adminUser.save();
      console.log('Đã tạo tài khoản Admin mới');
    } else {
      console.log('Tài khoản Admin đã tồn tại');
    }
    
    // Tạo tài khoản nhân viên nếu chưa có
    let staffUser = await User.findOne({ role: 'staff' });
    if (!staffUser) {
      staffUser = new User({
        name: 'Nhân viên',
        email: 'staff@example.com',
        password: hashedStaffPassword,
        phone: '0123456789',
        role: 'staff',
        isActive: true
      });
      await staffUser.save();
      console.log('Đã tạo tài khoản Nhân viên mới');
    } else {
      console.log('Tài khoản Nhân viên đã tồn tại');
    }
    
    // Tạo tài khoản khách hàng nếu chưa có
    let normalUser = await User.findOne({ role: 'user' });
    if (!normalUser) {
      normalUser = new User({
        name: 'Khách hàng',
        email: 'user@example.com',
        password: hashedUserPassword,
        phone: '0987654321',
        role: 'user',
        isActive: true
      });
      await normalUser.save();
      console.log('Đã tạo tài khoản Khách hàng mới');
    } else {
      console.log('Tài khoản Khách hàng đã tồn tại');
    }
    
    console.log('---- Hoàn tất tạo tài khoản mặc định ----');
    console.log('Admin username: admin, password: admin');
    console.log('Staff username: staff@example.com, password: staff123');
    console.log('User username: user@example.com, password: user123');
    
  } catch (error) {
    console.error('Lỗi khi tạo tài khoản mặc định:', error);
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
  await createDefaultUsers();
};

main(); 