import connectDB from '@/lib/db';
import Campaign from '@/models/Campaign';
import CampaignJoinRequest from '@/models/CampaignJoinRequest';
import { verifyToken } from '@/lib/jwtService';
import User from '@/models/User';
import {
  createNotification,
  notificationTemplates,
} from '@/lib/server/services/notificationService';

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
    const { platformLinks } = await req.json();

    // Verify user is a creator
    const user = await User.findById(userId);
    if (!user || user.role !== 'creator') {
      return Response.json(
        { success: false, message: 'Only creators can join campaigns' },
        { status: 403 }
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

    // Check if creator is already in the campaign
    const alreadyJoined = campaign.creators.some(c => c.creatorId.toString() === userId);
    if (alreadyJoined) {
      return Response.json(
        { success: false, message: 'You have already joined this campaign' },
        { status: 409 }
      );
    }

    // Validate that at least one platform link is provided
    if (!platformLinks || !Object.values(platformLinks).some(link => link?.trim())) {
      return Response.json(
        { success: false, message: 'At least one platform link is required' },
        { status: 400 }
      );
    }

    // Add creator to campaign
    campaign.creators.push({
      creatorId: userId,
      platformLinks: {
        youtube: platformLinks.youtube || '',
        tiktok: platformLinks.tiktok || '',
        instagram: platformLinks.instagram || '',
        twitter: platformLinks.twitter || '',
        other: platformLinks.other || '',
      },
      earnings: {
        total: 0,
        pending: 0,
        paid: 0,
      },
      joinedAt: new Date(),
    });

    await campaign.save();

    // Notify brand about new creator joining
    await createNotification(
      campaign.createdBy,
      'New Creator Joined! 🎬',
      `${user.name} has joined "${campaign.title}"`,
      'info',
      'creator_joined',
      {
        entityType: 'campaign',
        entityId: campaignId,
      }
    );

    return Response.json(
      {
        success: true,
        message: 'Successfully joined campaign',
        campaign,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Campaign join error:', error);
    return Response.json(
      { success: false, message: 'Failed to join campaign' },
      { status: 500 }
    );
  }
}
