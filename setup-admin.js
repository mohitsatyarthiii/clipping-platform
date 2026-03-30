import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Define User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'creator', 'clipper'], default: 'clipper' },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function setup() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected\n');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@clippingplatform.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

    console.log('🔍 Checking for existing admin...');
    const existingAdmin = await User.findOne({ email: adminEmail }).select('+password');
    
    if (existingAdmin) {
      console.log('⚠️  Found existing admin, deleting...');
      await User.deleteOne({ email: adminEmail });
      console.log('✓ Deleted existing admin\n');
    }

    console.log('👤 Creating new admin user...');
    const admin = await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
    });

    // Verify password works
    console.log('🔐 Verifying password...');
    const testUser = await User.findOne({ email: adminEmail }).select('+password');
    const isMatch = await testUser.comparePassword(adminPassword);
    
    if (isMatch) {
      console.log('✅ Password verification SUCCESS\n');
    } else {
      console.log('❌ Password verification FAILED\n');
    }

    console.log('✅ Admin setup complete!\n');
    console.log('📧 Email:', adminEmail);
    console.log('🔐 Password:', adminPassword);
    console.log('\nYou can now login at http://localhost:3000/login');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

setup();
