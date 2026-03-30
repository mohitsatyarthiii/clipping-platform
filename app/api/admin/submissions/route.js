import connectDB from '@/lib/db';
import Submission from '@/models/Submission';
import { verifyToken } from '@/lib/jwtService';
import User from '@/models/User';
import {
  createNotification,
  notificationTemplates,
} from '@/lib/notificationService';
import { approveAndProcessEarnings } from '@/lib/earningsService';

// GET all submissions (admin)
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
    const campaignId = searchParams.get('campaign');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    const skip = (page - 1) * limit;
    const filter = {};
    if (status) filter.status = status;
    if (campaignId) filter.campaignId = campaignId;

    // Use parallel queries
    const [submissions, total] = await Promise.all([
      Submission.find(filter)
        .select('-__v')
        .populate('userId', 'name email profileImage')
        .populate('campaignId', 'title')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Submission.countDocuments(filter),
    ]);

    return Response.json(
      {
        success: true,
        submissions,
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
    console.error('Get submissions error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
