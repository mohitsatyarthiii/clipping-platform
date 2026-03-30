import connectDB from '@/lib/db';
import User from '@/models/User';
import Campaign from '@/models/Campaign';
import Submission from '@/models/Submission';
import CampaignJoinRequest from '@/models/CampaignJoinRequest';
import { verifyToken } from '@/lib/jwtService';
import { getEarningsStats } from '@/lib/earningsService';

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

    // Use parallel queries for better performance
    const [
      totalUsers,
      totalCampaigns,
      totalSubmissions,
      pendingJoinRequests,
      pendingSubmissions,
      totalViewsResult,
      earningsStats,
      recentSubmissions,
    ] = await Promise.all([
      User.countDocuments(),
      Campaign.countDocuments(),
      Submission.countDocuments(),
      CampaignJoinRequest.countDocuments({ status: 'pending' }),
      Submission.countDocuments({ status: 'pending' }),
      Submission.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$views' },
          },
        },
      ]),
      getEarningsStats(),
      Submission.find()
        .select('userId campaignId createdAt')
        .populate('userId', 'name')
        .populate('campaignId', 'title')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return Response.json(
      {
        success: true,
        dashboard: {
          totalUsers,
          totalCampaigns,
          totalSubmissions,
          pendingJoinRequests,
          pendingSubmissions,
          totalViews: totalViewsResult[0]?.total || 0,
          earnings: earningsStats.earnings,
          recentSubmissions,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch admin dashboard' },
      { status: 500 }
    );
  }
}
