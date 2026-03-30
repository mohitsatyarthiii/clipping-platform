import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateResetToken, generateResetTokenHash } from '@/lib/jwtService';
import { validateEmail } from '@/lib/validators';

export async function POST(req) {
  await connectDB();

  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return Response.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if email exists for security reasons
      return Response.json(
        {
          success: true,
          message:
            'If an account exists, password reset instructions have been sent',
        },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenHash = generateResetTokenHash(resetToken);

    // Set reset token and expiration (30 minutes)
    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    // In production, send email with reset link
    // For now, return the token in response for testing
    // TODO: Integrate with email service (Nodemailer, SendGrid, etc.)

    const resetLink = `${process.env.NEXT_PUBLIC_API_URL}/reset-password?token=${resetToken}`;

    console.log('Password reset link:', resetLink);

    return Response.json(
      {
        success: true,
        message:
          'Password reset instructions have been sent to your email',
        // Remove in production
        ...(process.env.NODE_ENV === 'development' && { resetToken }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return Response.json(
      { success: false, message: 'Failed to process forgot password request' },
      { status: 500 }
    );
  }
}
