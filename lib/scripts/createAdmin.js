import connectDB from '@/lib/db';
import User from '@/models/User';

/**
 * One-time script to create admin user
 * Run once after initial setup
 * Usage: node lib/scripts/createAdmin.js
 */

const createAdminUser = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Checking for existing admin...');
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('✓ Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    console.log('Creating admin user...');
    const admin = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@clippingplatform.com',
      password: process.env.ADMIN_PASSWORD || 'admin123456',
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
    });

    console.log('✓ Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password:', process.env.ADMIN_PASSWORD || 'admin123456');
    console.log(
      '\n⚠️  IMPORTANT: Change the password after first login!'
    );
    console.log(
      '⚠️  Store credentials securely - never commit them to version control!'
    );

    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating admin:', error.message);
    process.exit(1);
  }
};

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createAdminUser();
}

export default createAdminUser;
