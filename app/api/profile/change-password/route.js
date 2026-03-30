import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwtService';
import { validatePassword } from '@/lib/validators';

export async function PUT(req) {
  await connectDB();

  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = verifyToken(token);
    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (!userId) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return Response.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!validatePassword(newPassword)) {
      return Response.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return Response.json(
        { success: false, message: 'New passwords do not match' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId).select('+password');

    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return Response.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return Response.json(
      {
        success: true,
        message: 'Password changed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Change password error:', error);
    return Response.json(
      { success: false, message: 'Failed to change password' },
      { status: 500 }
    );
  }
}
