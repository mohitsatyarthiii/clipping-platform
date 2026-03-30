import connectDB from '@/lib/db';
import SourceContent from '@/models/SourceContent';
import Campaign from '@/models/Campaign';
import { verifyToken } from '@/lib/jwtService';
import User from '@/models/User';
import {
  validateYoutubeUrl,
  extractYoutubeVideoId,
} from '@/lib/validators';
import { getVideoDetails } from '@/lib/youtubeService';

export async function POST(req) {
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
        { success: false, message: 'Only creators can upload source content' },
        { status: 403 }
      );
    }

    const { campaignId, youtubeUrl } = await req.json();

    if (!campaignId || !youtubeUrl) {
      return Response.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!validateYoutubeUrl(youtubeUrl)) {
      return Response.json(
        { success: false, message: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Verify campaign exists
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return Response.json(
        { success: false, message: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Extract video ID
    const youtubeVideoId = extractYoutubeVideoId(youtubeUrl);
    if (!youtubeVideoId) {
      return Response.json(
        { success: false, message: 'Failed to extract video ID' },
        { status: 400 }
      );
    }

    // Check for duplicate source video ID
    const existingSource = await SourceContent.findOne({ youtubeVideoId });
    if (existingSource) {
      return Response.json(
        { success: false, message: 'This video has already been uploaded' },
        { status: 409 }
      );
    }

    // Fetch video details from YouTube
    let videoDetails = {
      title: null,
      thumbnail: null,
      duration: null,
    };

    try {
      const details = await getVideoDetails(youtubeVideoId);
      videoDetails = {
        title: details.title,
        thumbnail: details.thumbnail,
        duration: details.duration,
      };
    } catch (error) {
      console.warn('Failed to fetch YouTube details:', error.message);
    }

    // Create source content
    const sourceContent = await SourceContent.create({
      creatorId: userId,
      campaignId,
      youtubeUrl,
      youtubeVideoId,
      title: videoDetails.title,
      thumbnail: videoDetails.thumbnail,
      duration: videoDetails.duration,
      status: 'active',
    });

    return Response.json(
      {
        success: true,
        message: 'Source content uploaded successfully',
        sourceContent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload source content error:', error);
    return Response.json(
      { success: false, message: 'Failed to upload source content' },
      { status: 500 }
    );
  }
}

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
    const campaignId = searchParams.get('campaign');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    const skip = (page - 1) * limit;
    const filter = { creatorId: userId };
    if (campaignId) filter.campaignId = campaignId;

    const sourceContents = await SourceContent.find(filter)
      .populate('campaignId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SourceContent.countDocuments(filter);

    return Response.json(
      {
        success: true,
        sourceContents,
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
    console.error('Get source contents error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch source contents' },
      { status: 500 }
    );
  }
}
