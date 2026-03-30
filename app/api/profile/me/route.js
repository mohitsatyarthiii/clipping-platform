import connectDB from '@/lib/db';
import { protectRoute } from '@/middlewares/auth';
import User from '@/models/User';

export async function GET(req) {
  await connectDB();

  try {
    // Check auth header
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For simplicity, manually verify token in route
    // In production, use middleware pattern
    const { userId } = await import('@/lib/jwtService').then((m) =>
      m.verifyToken(token)
    );

    const user = await User.findById(userId);

    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          bio: user.bio,
          earnings: user.earnings,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
