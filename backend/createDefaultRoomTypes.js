const mongoose = require('mongoose');
const dotenv = require('dotenv');
const RoomType = require('./models/RoomType');

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

// Create default room types
const createDefaultRoomTypes = async () => {
  try {
    console.log('---- Tạo các loại phòng mặc định ----');

    // Các loại phòng mặc định
    const defaultRoomTypes = [
      {
        name: 'Standard',
        description: 'Phòng tiêu chuẩn, đầy đủ tiện nghi cơ bản',
        basePrice: 700000
      },
      {
        name: 'Deluxe',
        description: 'Phòng sang trọng với không gian rộng rãi và tiện nghi cao cấp',
        basePrice: 1200000
      },
      {
        name: 'Suite',
        description: 'Phòng hạng sang với phòng khách riêng biệt và view đẹp',
        basePrice: 2000000
      },
      {
        name: 'Family',
        description: 'Phòng gia đình rộng rãi, phù hợp cho 4-5 người',
        basePrice: 1500000
      }
    ];

    // Tạo hoặc cập nhật các loại phòng
    for (const roomType of defaultRoomTypes) {
      // Kiểm tra xem loại phòng đã tồn tại chưa
      const existingType = await RoomType.findOne({ name: roomType.name });
      
      if (existingType) {
        console.log(`Loại phòng "${roomType.name}" đã tồn tại. Bỏ qua.`);
      } else {
        const newRoomType = new RoomType(roomType);
        await newRoomType.save();
        console.log(`Đã tạo loại phòng: ${roomType.name}`);
      }
    }

    console.log('---- Hoàn tất tạo loại phòng mặc định ----');
  } catch (error) {
    console.error('Lỗi khi tạo loại phòng mặc định:', error);
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
  await createDefaultRoomTypes();
};

main(); 