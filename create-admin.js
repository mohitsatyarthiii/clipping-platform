import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'creator', 'clipper'],
    default: 'clipper',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    console.log('🔍 Checking for existing admin...');
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      await mongoose.connection.close();
      process.exit(0);
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@clippingplatform.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

    console.log('\n👤 Creating admin user...');
    const admin = await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
    });

    console.log('\n✅ Admin user created successfully!\n');
    console.log('📧 Email:', adminEmail);
    console.log('🔐 Password:', adminPassword);
    console.log('\n⚠️  IMPORTANT NOTES:');
    console.log('   1. Change the password after first login');
    console.log('   2. Store credentials securely');
    console.log('   3. Never commit credentials to version control');
    console.log('   4. Update .env.local with secure credentials\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating admin:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createAdminUser();
