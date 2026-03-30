import connectDB from '@/lib/db';
import Submission from '@/models/Submission';
import CampaignJoinRequest from '@/models/CampaignJoinRequest';
import Campaign from '@/models/Campaign';
import { verifyToken } from '@/lib/jwtService';
import { extractYoutubeVideoId, validateYoutubeUrl } from '@/lib/validators';
import {
  checkDuplicateSubmission,
} from '@/lib/duplicateService';
import {
  createNotification,
  notificationTemplates,
} from '@/lib/notificationService';

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
    const { campaignId, uploadedVideoUrl, youtubeShortUrl } = await req.json();

    if (!campaignId || !uploadedVideoUrl || !youtubeShortUrl) {
      return Response.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify YouTube URL
    if (!validateYoutubeUrl(youtubeShortUrl)) {
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

    // Verify user is approved for campaign
    const joinRequest = await CampaignJoinRequest.findOne({
      userId,
      campaignId,
      status: 'approved',
    });

    if (!joinRequest) {
      return Response.json(
        {
          success: false,
          message: 'You are not approved for this campaign',
        },
        { status: 403 }
      );
    }

    // Extract video ID
    const youtubeVideoId = extractYoutubeVideoId(youtubeShortUrl);
    if (!youtubeVideoId) {
      return Response.json(
        { success: false, message: 'Failed to extract video ID' },
        { status: 400 }
      );
    }

    // Check for duplicates
    const duplicateCheck = await checkDuplicateSubmission(
      youtubeVideoId,
      campaignId,
      userId
    );

    if (duplicateCheck.isDuplicate) {
      return Response.json(
        {
          success: false,
          message: duplicateCheck.message,
          isDuplicate: true,
        },
        { status: 409 }
      );
    }

    // Create submission
    const submission = await Submission.create({
      userId,
      campaignId,
      uploadedVideoUrl,
      youtubeShortUrl,
      youtubeVideoId,
      status: 'pending',
    });

    // Notify admin of new submission
    await createNotification(
      campaign.createdBy,
      'New Submission Received 📹',
      `A new submission has been received for "${campaign.title}"`,
      'info',
      'new_submission',
      {
        entityType: 'submission',
        entityId: submission._id,
      }
    );

    return Response.json(
      {
        success: true,
        message: 'Submission created successfully',
        submission,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create submission error:', error);
    return Response.json(
      { success: false, message: 'Failed to create submission' },
      { status: 500 }
    );
  }
}
