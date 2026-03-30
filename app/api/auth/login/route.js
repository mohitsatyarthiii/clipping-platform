import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/jwtService';
import { validateEmail } from '@/lib/validators';

export async function POST(req) {
  await connectDB();

  try {
    const { email, password } = await req.json();
    console.log('🔓 Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      return Response.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return Response.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password +loginAttempts +lockUntil');

    if (!user) {
      console.log('❌ User not found:', email);
      return Response.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('✓ User found:', user.email, 'Role:', user.role);

    // Check if account is locked
    if (user.isLocked()) {
      const timeLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return Response.json(
        {
          success: false,
          message: `Account locked. Try again in ${timeLeft} minutes`,
        },
        { status: 423 }
      );
    }

    // Check if account is active
    if (!user.isActive) {
      return Response.json(
        { success: false, message: 'Account is inactive' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      console.log('❌ Password mismatch for:', email);
      await user.incLoginAttempts();
      return Response.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('✅ Password valid, generating token...');

    // Reset login attempts
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    const responseData = {
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    };

    console.log('📤 Sending login response:', {
      success: responseData.success,
      email: responseData.user.email,
      role: responseData.user.role,
      token: token ? 'provided' : 'missing',
    });

    return Response.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}
