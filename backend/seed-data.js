const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('./models/Room');
const Booking = require('./models/Booking');
const User = require('./models/User');
const Service = require('./models/Service');
const RoomType = require('./models/RoomType');
const bcrypt = require('bcryptjs');
const Feature = require('./models/Feature');

// Config
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

// Clear previous data
const clearData = async () => {
  try {
    if (process.argv.includes('--clear')) {
      console.log('Clearing all existing data...');
      await Promise.all([
        Room.deleteMany({}),
        Booking.deleteMany({}),
        User.deleteMany({}),
        Service.deleteMany({}),
        RoomType.deleteMany({}),
        Feature.deleteMany({})
      ]);
      console.log('All data cleared.');
    } else {
      console.log('Keeping existing data. Use --clear to remove all data before seeding.');
    }
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
};

// Seed sample data
const seedData = async () => {
  try {
    // Add room types
    console.log('Creating room types...');
    const roomTypes = await RoomType.insertMany([
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
    ]);

    // Add users if none exist
    console.log('Creating users...');
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedAdminPassword = await bcrypt.hash('admin123', salt);
      const hashedStaffPassword = await bcrypt.hash('staff123', salt);
      
      await User.insertMany([
        {
          name: 'Administrator',
          email: 'admin',
          password: hashedAdminPassword,
          role: 'admin',
          isActive: true
        },
        {
          name: 'Tran Quy Tai',
          email: 'tranquytai0402@gmail.com',
          password: hashedStaffPassword,
          role: 'staff',
          isActive: true
        },
        {
          name: 'Nguyen Van A',
          email: 'nguyenvana@example.com',
          password: await bcrypt.hash('user123', salt),
          role: 'user',
          isActive: true
        }
      ]);
    }
    
    // Get users and room types for relations
    const adminUser = await User.findOne({ role: 'admin' });
    const staffUser = await User.findOne({ role: 'staff' });
    const standardType = await RoomType.findOne({ name: 'Standard' });
    const deluxeType = await RoomType.findOne({ name: 'Deluxe' });
    const suiteType = await RoomType.findOne({ name: 'Suite' });
    const familyType = await RoomType.findOne({ name: 'Family' });
    
    // Add rooms
    console.log('Creating rooms...');
    const roomsData = [
      {
        roomNumber: '101',
        type: standardType._id,
        description: 'Phòng tiêu chuẩn tầng 1',
        price: 750000,
        capacity: 2,
        amenities: ['TV', 'Wifi', 'Máy lạnh', 'Tủ lạnh'],
        status: 'available',
        floor: 1
      },
      {
        roomNumber: '102',
        type: standardType._id,
        description: 'Phòng tiêu chuẩn tầng 1',
        price: 750000,
        capacity: 2,
        amenities: ['TV', 'Wifi', 'Máy lạnh', 'Tủ lạnh'],
        status: 'available',
        floor: 1
      },
      {
        roomNumber: '201',
        type: deluxeType._id,
        description: 'Phòng deluxe tầng 2',
        price: 1250000,
        capacity: 2,
        amenities: ['TV', 'Wifi', 'Máy lạnh', 'Tủ lạnh', 'Minibar'],
        status: 'booked',
        floor: 2
      },
      {
        roomNumber: '202',
        type: deluxeType._id,
        description: 'Phòng deluxe tầng 2',
        price: 1250000,
        capacity: 2,
        amenities: ['TV', 'Wifi', 'Máy lạnh', 'Tủ lạnh', 'Minibar'],
        status: 'occupied',
        floor: 2
      },
      {
        roomNumber: '301',
        type: suiteType._id,
        description: 'Phòng suite tầng 3',
        price: 2100000,
        capacity: 2,
        amenities: ['TV', 'Wifi', 'Máy lạnh', 'Tủ lạnh', 'Minibar', 'Bồn tắm', 'Đồ uống miễn phí'],
        status: 'available',
        floor: 3
      },
      {
        roomNumber: '401',
        type: familyType._id,
        description: 'Phòng gia đình tầng 4',
        price: 1600000,
        capacity: 4,
        amenities: ['TV', 'Wifi', 'Máy lạnh', 'Tủ lạnh', 'Minibar', '2 phòng ngủ'],
        status: 'maintenance',
        floor: 4
      }
    ];
    
    // Insert rooms
    const rooms = await Room.insertMany(roomsData);
    
    // Add bookings
    console.log('Creating bookings...');
    const today = new Date();
    
    const bookingsData = [
      {
        user: adminUser._id,
        room: rooms[2]._id, // Room 201 (deluxe, booked)
        checkInDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
        checkOutDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
        numberOfGuests: { adults: 2, children: 0 },
        totalPrice: 2500000,
        status: 'confirmed',
        paymentStatus: 'paid'
      },
      {
        user: staffUser._id,
        room: rooms[3]._id, // Room 202 (deluxe, occupied)
        checkInDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
        checkOutDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
        numberOfGuests: { adults: 2, children: 0 },
        totalPrice: 3750000,
        status: 'checked-in',
        paymentStatus: 'paid'
      },
      {
        isGuestBooking: true,
        guestName: 'Nguyen Van Khach',
        guestEmail: 'khach@example.com',
        guestPhone: '0987654321',
        room: rooms[0]._id, // Room 101 (standard, available)
        checkInDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        checkOutDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
        numberOfGuests: { adults: 1, children: 0 },
        totalPrice: 750000,
        status: 'pending',
        paymentStatus: 'pending'
      },
      {
        user: adminUser._id,
        room: rooms[4]._id, // Room 301 (suite, available)
        checkInDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5),
        checkOutDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3),
        numberOfGuests: { adults: 2, children: 0 },
        totalPrice: 4200000,
        status: 'checked-out',
        paymentStatus: 'paid'
      }
    ];
    
    await Booking.insertMany(bookingsData);
    
    // Add services
    console.log('Creating services...');
    const servicesData = [
      {
        name: 'Dọn phòng',
        description: 'Dịch vụ dọn phòng',
        price: 0,
        roomNumber: '202',
        status: 'pending',
        requestedBy: staffUser._id
      },
      {
        name: 'Giặt là',
        description: 'Dịch vụ giặt ủi quần áo',
        price: 150000,
        roomNumber: '202',
        status: 'completed',
        requestedBy: staffUser._id
      }
    ];
    
    await Service.insertMany(servicesData);
    
    // Add features
    console.log('Creating features...');
    const featuresData = [
      {
        title: 'Comfortable Rooms',
        description: 'Our rooms are designed with comfort in mind. High-quality bedding and amenities to make your stay perfect.',
        type: 'room',
        order: 1,
        isActive: true
      },
      {
        title: 'Spa Services',
        description: 'Relax and rejuvenate with our premium spa services, featuring a range of treatments to suit your needs.',
        type: 'spa',
        order: 2,
        isActive: true
      },
      {
        title: 'Gourmet Dining',
        description: 'Experience exquisite cuisine prepared by our world-class chefs using only the freshest ingredients.',
        type: 'dining',
        order: 3,
        isActive: true
      },
      {
        title: '24/7 Room Service',
        description: 'Whatever you need, whenever you need it. Our dedicated staff is available around the clock.',
        type: 'roomservice',
        order: 4,
        isActive: true
      },
      {
        title: 'Free High-Speed WiFi',
        description: 'Stay connected with complimentary high-speed internet access throughout the hotel.',
        type: 'wifi',
        order: 5,
        isActive: true
      },
      {
        title: 'Fitness Center',
        description: 'Maintain your fitness routine in our state-of-the-art gym with modern equipment.',
        type: 'fitness',
        order: 6,
        isActive: true
      },
      {
        title: 'Swimming Pool',
        description: 'Take a refreshing dip in our beautiful pool or relax on the sundeck.',
        type: 'pool',
        order: 7,
        isActive: true
      }
    ];
    
    await Feature.insertMany(featuresData);
    
    console.log('Seed data completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Main function
const main = async () => {
  const conn = await connectDB();
  await clearData();
  await seedData();
  
  console.log('Database seeded successfully!');
  process.exit(0);
};

// Run the seeding process
main(); 