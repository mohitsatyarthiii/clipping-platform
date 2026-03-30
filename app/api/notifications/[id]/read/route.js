import connectDB from '@/lib/db';
import Notification from '@/models/Notification';
import { verifyToken } from '@/lib/jwtService';
import { markAsRead, markAllAsRead } from '@/lib/notificationService';

export async function PUT(req, { params }) {
  await connectDB();

  try {
    const { id: notificationId } = params;
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = verifyToken(token);

    // Verify notification belongs to user
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return Response.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }

    if (notification.userId.toString() !== userId) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const updatedNotification = await markAsRead(notificationId);

    return Response.json(
      {
        success: true,
        message: 'Notification marked as read',
        notification: updatedNotification,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return Response.json(
      { success: false, message: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
