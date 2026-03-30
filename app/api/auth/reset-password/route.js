import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateResetTokenHash } from '@/lib/jwtService';
import { validatePassword } from '@/lib/validators';

export async function POST(req) {
  await connectDB();

  try {
    const { token, newPassword, confirmPassword } = await req.json();

    if (!token || !newPassword) {
      return Response.json(
        { success: false, message: 'Token and new password are required' },
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
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    const resetTokenHash = generateResetTokenHash(token);

    const user = await User.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return Response.json(
        { success: false, message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return Response.json(
      {
        success: true,
        message: 'Password reset successful. Please login with your new password',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return Response.json(
      { success: false, message: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
