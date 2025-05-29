const mongoose = require('mongoose');
const Feature = require('./models/Feature');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const sampleFeatures = [
  {
    title: 'Phòng tắm riêng',
    description: 'Tất cả phòng đều có phòng tắm riêng với đầy đủ tiện nghi',
    type: 'room',
    order: 1,
    isActive: true
  },
  {
    title: 'Spa & Wellness',
    description: 'Dịch vụ spa thư giãn với các liệu pháp chăm sóc sức khỏe',
    type: 'spa',
    order: 2,
    isActive: true
  },
  {
    title: 'Nhà hàng',
    description: 'Nhà hàng phục vụ các món ăn Việt Nam và quốc tế',
    type: 'dining',
    order: 3,
    isActive: true
  },
  {
    title: 'WiFi miễn phí',
    description: 'Kết nối WiFi tốc độ cao miễn phí trong toàn bộ khách sạn',
    type: 'wifi',
    order: 4,
    isActive: true
  },
  {
    title: 'Hồ bơi',
    description: 'Hồ bơi ngoài trời với view đẹp và khu vực thư giãn',
    type: 'pool',
    order: 5,
    isActive: true
  },
  {
    title: 'Phòng gym',
    description: 'Phòng tập gym hiện đại với đầy đủ thiết bị',
    type: 'fitness',
    order: 6,
    isActive: true
  }
];

const createFeatures = async () => {
  try {
    await connectDB();
    
    // Clear existing features
    await Feature.deleteMany({});
    console.log('Cleared existing features');
    
    // Create new features
    const features = await Feature.insertMany(sampleFeatures);
    console.log(`Created ${features.length} features:`, features.map(f => f.title));
    
    console.log('Sample features created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error creating features:', err);
    process.exit(1);
  }
};

createFeatures();
