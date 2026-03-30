import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwtService';

export async function GET(req) {
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
    const user = await User.findById(userId).lean();

    if (!user || user.role !== 'admin') {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;

    const skip = (page - 1) * limit;
    const filter = {};
    if (role) filter.role = role;

    // Use parallel queries
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return Response.json(
      {
        success: true,
        users: users || [],
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get users error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
