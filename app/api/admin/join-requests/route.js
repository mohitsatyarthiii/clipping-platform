import connectDB from '@/lib/db';
import CampaignJoinRequest from '@/models/CampaignJoinRequest';
import Campaign from '@/models/Campaign';
import { verifyToken } from '@/lib/jwtService';
import User from '@/models/User';
import {
  createNotification,
  notificationTemplates,
} from '@/lib/notificationService';

// GET all join requests (admin)
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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    const skip = (page - 1) * limit;
    const filter = {};
    if (status) filter.status = status;

    // Use parallel queries for better performance
    const [joinRequests, total] = await Promise.all([
      CampaignJoinRequest.find(filter)
        .select('-__v')
        .populate('userId', 'name email profileImage')
        .populate('campaignId', 'title')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CampaignJoinRequest.countDocuments(filter),
    ]);

    return Response.json(
      {
        success: true,
        joinRequests: joinRequests || [],
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
    console.error('Get join requests error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch join requests', error: error.message },
      { status: 500 }
    );
  }
}
