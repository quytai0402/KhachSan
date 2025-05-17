const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('Admin user already exists!');
      console.log(`Email: ${adminExists.email}`);
      process.exit(0);
    }

    // Create hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin', salt);

    // Create new admin user
    const adminUser = new User({
      name: 'Administrator',
      email: 'admin',
      password: hashedPassword,
      phone: '',
      role: 'admin'
    });

    // Save to database
    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin');
    
  } catch (err) {
    console.error('Error creating admin user:', err.message);
  } finally {
    // Close connection
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Run the function
createAdminUser(); 