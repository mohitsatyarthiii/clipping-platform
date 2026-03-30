import connectDB from '@/lib/db';
import Notification from '@/models/Notification';
import { verifyToken } from '@/lib/jwtService';
import { getUserNotifications, getUnreadCount } from '@/lib/server/services/notificationService';

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
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const includeRead = searchParams.get('includeRead') === 'true';

    const skip = (page - 1) * limit;
    const filter = { userId };
    if (!includeRead) {
      filter.isRead = false;
    }

    // Use parallel queries
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      getUnreadCount(userId),
    ]);

    return Response.json(
      {
        success: true,
        notifications,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
          unreadCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get notifications error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
