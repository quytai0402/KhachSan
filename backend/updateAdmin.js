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

const updateAdminUser = async () => {
  try {
    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('No admin user found. Creating new admin user...');
      
      // Create hashed password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin', salt);

      // Create new admin user
      const newAdmin = new User({
        name: 'Administrator',
        email: 'admin',
        password: hashedPassword,
        role: 'admin'
      });

      // Save to database
      await newAdmin.save();
      console.log('Admin user created successfully!');
    } else {
      // Create hashed password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin', salt);
      
      // Update the existing admin user
      adminUser.email = 'admin';
      adminUser.password = hashedPassword;
      adminUser.name = 'Administrator';
      
      // Save the changes
      await adminUser.save();
      console.log('Admin user updated successfully!');
    }
    
    console.log('Admin credentials:');
    console.log('Username: admin');
    console.log('Password: admin');
    
  } catch (err) {
    console.error('Error updating admin user:', err.message);
  } finally {
    // Close connection
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Run the function
updateAdminUser(); 