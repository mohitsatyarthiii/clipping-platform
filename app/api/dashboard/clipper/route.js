import connectDB from '@/lib/db';
import User from '@/models/User';
import Submission from '@/models/Submission';
import CampaignJoinRequest from '@/models/CampaignJoinRequest';
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
    
    // Fetch user with lean() for read-only operation
    const user = await User.findById(userId).lean();

    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Parallel queries for better performance
    const [joinedCampaigns, submissions, pendingJoinRequests, pendingApprovals] = await Promise.all([
      // Get joined campaigns
      CampaignJoinRequest.find({
        userId,
        status: 'approved',
      })
        .select('campaignId createdAt')
        .populate('campaignId', 'title description payoutPer1000Views')
        .sort({ createdAt: -1 })
        .lean(),
      
      // Get all submissions for this user
      Submission.find({ userId })
        .select('status views earnings campaignId createdAt')
        .populate('campaignId', 'title')
        .lean(),
      
      // Get pending join requests
      CampaignJoinRequest.find({
        userId,
        status: 'pending',
      })
        .select('campaignId createdAt')
        .populate('campaignId', 'title')
        .sort({ createdAt: -1 })
        .lean(),
      
      // Get pending submissions count
      Submission.countDocuments({
        userId,
        status: 'pending',
      }),
    ]);

    // Calculate stats from submissions
    const totalViews = submissions.reduce((sum, sub) => sum + (sub.views || 0), 0);
    const totalEarnings = submissions.reduce((sum, sub) => sum + (sub.earnings || 0), 0);
    const approvedSubmissions = submissions.filter((s) => s.status === 'approved');

    // Get top performing clips
    const topClips = approvedSubmissions
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map((sub) => ({
        id: sub._id,
        campaignTitle: sub.campaignId?.title || 'Unknown Campaign',
        views: sub.views,
        earnings: sub.earnings,
        createdAt: sub.createdAt,
      }));

    return Response.json(
      {
        success: true,
        data: {
          joinedCampaigns: joinedCampaigns,
          joinedCampaignsCount: joinedCampaigns.length,
          pendingApprovals,
          totalEarnings: user.earnings?.total || 0,
          totalViews,
          earnings: {
            total: user.earnings?.total || 0,
            pending: user.earnings?.pending || 0,
            paid: user.earnings?.paid || 0,
          },
          totalSubmissions: submissions.length,
          approvedSubmissions: approvedSubmissions.length,
          availableCampaigns: 0,
          pendingSubmissions: pendingApprovals,
          pendingJoinRequests,
          topClips,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get clipper dashboard error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch clipper dashboard' },
      { status: 500 }
    );
  }
}
