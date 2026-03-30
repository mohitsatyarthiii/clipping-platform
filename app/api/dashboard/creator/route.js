import connectDB from '@/lib/db';
import User from '@/models/User';
import SourceContent from '@/models/SourceContent';
import Submission from '@/models/Submission';
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
    const user = await User.findById(userId);

    if (!user || user.role !== 'creator') {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get source content
    const sourceContents = await SourceContent.find({
      creatorId: userId,
    }).populate('campaignId', 'title');

    const totalViews = sourceContents.reduce((sum, content) => {
      // Would need to aggregate submissions views for this source
      return sum;
    }, 0);

    // Get clips performance from submissions referencing this creator's content
    const submissions = await Submission.find({
      sourceContentId: { $in: sourceContents.map((c) => c._id) },
    }).populate('campaignId', 'title');

    const totalClipsFromContent = submissions.length;
    const totalViewsFromClips = submissions.reduce(
      (sum, sub) => sum + sub.views,
      0
    );

    // Top performing clips
    const topClips = submissions
      .filter((s) => s.status === 'approved')
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map((sub) => ({
        id: sub._id,
        campaignTitle: sub.campaignId.title,
        views: sub.views,
        createdAt: sub.createdAt,
      }));

    return Response.json(
      {
        success: true,
        dashboard: {
          sourceContentCount: sourceContents.length,
          totalViews,
          totalClipsFromContent,
          totalViewsFromClips,
          topClips,
          sourceContents: sourceContents.map((content) => ({
            id: content._id,
            campaignTitle: content.campaignId.title,
            youtubeUrl: content.youtubeUrl,
            title: content.title,
            createdAt: content.createdAt,
          })),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get creator dashboard error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch creator dashboard' },
      { status: 500 }
    );
  }
}
