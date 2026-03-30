import connectDB from '@/lib/db';
import Campaign from '@/models/Campaign';
import CampaignJoinRequest from '@/models/CampaignJoinRequest';
import { verifyToken } from '@/lib/jwtService';
import User from '@/models/User';
import {
  createNotification,
  notificationTemplates,
} from '@/lib/notificationService';

export async function POST(req, { params }) {
  await connectDB();

  try {
    const { id: campaignId } = params;
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = verifyToken(token);

    // Verify campaign exists
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return Response.json(
        { success: false, message: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check if already requested
    const existingRequest = await CampaignJoinRequest.findOne({
      userId,
      campaignId,
    });

    if (existingRequest) {
      return Response.json(
        { success: false, message: 'You have already requested to join this campaign' },
        { status: 409 }
      );
    }

    // Create join request
    const joinRequest = await CampaignJoinRequest.create({
      userId,
      campaignId,
      status: 'pending',
    });

    // Notify admin (creator) about new join request
    await createNotification(
      campaign.createdBy,
      'New Join Request 🎬',
      `A new user is requesting to join "${campaign.title}"`,
      'info',
      'new_join_request',
      {
        entityType: 'joinRequest',
        entityId: joinRequest._id,
      }
    );

    return Response.json(
      {
        success: true,
        message: 'Join request submitted successfully',
        joinRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Campaign join error:', error);
    return Response.json(
      { success: false, message: 'Failed to submit join request' },
      { status: 500 }
    );
  }
}
