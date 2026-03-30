import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken, generateResetToken, generateResetTokenHash } from '@/lib/jwtService';
import { validateEmail, validatePassword, sanitizeInput } from '@/lib/validators';

export async function POST(req) {
  await connectDB();

  try {
    const { name, email, password, confirmPassword, role = 'creator' } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return Response.json(
        { success: false, message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['brand', 'creator'];
    if (!validRoles.includes(role)) {
      return Response.json(
        { success: false, message: 'Invalid role provided' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return Response.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return Response.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return Response.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return Response.json(
        { success: false, message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Create user with specified role
    const user = await User.create({
      name: sanitizeInput(name),
      email: email.toLowerCase(),
      password,
      role,
    });

    // Generate token
    const token = generateToken(user._id);

    return Response.json(
      {
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json(
      { success: false, message: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
