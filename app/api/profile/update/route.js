import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwtService';
import { sanitizeInput } from '@/lib/validators';

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
    const { name, bio, profileImage } = await req.json();

    if (!userId) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (name) user.name = sanitizeInput(name);
    if (bio) user.bio = sanitizeInput(bio);
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    return Response.json(
      {
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          bio: user.bio,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return Response.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
