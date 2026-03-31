import connectDB from '@/lib/db';
import Campaign from '@/models/Campaign';
import { verifyToken } from '@/lib/jwtService';
import User from '@/models/User';

// UPDATE creator platform links (brand can update for their campaigns)
export async function PUT(req, { params }) {
  await connectDB();

  try {
    const { id: campaignId, creatorId } = params;
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = verifyToken(token);
    const user = await User.findById(userId);

    if (!user || !['admin', 'brand'].includes(user.role)) {
      return Response.json(
        { success: false, message: 'Only admins and brands can manage creators' },
        { status: 403 }
      );
    }

    // Verify campaign exists and user has permission
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return Response.json(
        { success: false, message: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Brands can only manage creators in their campaigns
    if (user.role === 'brand' && campaign.createdBy.toString() !== userId) {
      return Response.json(
        { success: false, message: 'You can only manage creators in campaigns you created' },
        { status: 403 }
      );
    }

    // Find the creator in the campaign
    const creatorIndex = campaign.creators.findIndex(
      (c) => c.creatorId?.toString() === creatorId
    );

    if (creatorIndex === -1) {
      return Response.json(
        { success: false, message: 'Creator not found in this campaign' },
        { status: 404 }
      );
    }

    const { platformLinks, status, bannedReason, action } = await req.json();

    // Handle different actions
    if (action === 'remove') {
      // Remove creator from campaign entirely
      campaign.creators = campaign.creators.filter(
        (c) => c.creatorId?.toString() !== creatorId
      );
    } else if (action === 'update-links' && platformLinks) {
      // Update platform links
      campaign.creators[creatorIndex].platformLinks = {
        youtube: platformLinks.youtube || campaign.creators[creatorIndex].platformLinks?.youtube,
        tiktok: platformLinks.tiktok || campaign.creators[creatorIndex].platformLinks?.tiktok,
        instagram: platformLinks.instagram || campaign.creators[creatorIndex].platformLinks?.instagram,
        twitter: platformLinks.twitter || campaign.creators[creatorIndex].platformLinks?.twitter,
        other: platformLinks.other || campaign.creators[creatorIndex].platformLinks?.other,
      };
    } else if (action === 'ban') {
      // Ban creator
      campaign.creators[creatorIndex].status = 'banned';
      campaign.creators[creatorIndex].bannedAt = new Date();
      campaign.creators[creatorIndex].bannedReason = bannedReason || 'No reason provided';
    } else if (action === 'suspend') {
      // Suspend creator
      campaign.creators[creatorIndex].status = 'suspended';
      campaign.creators[creatorIndex].bannedAt = new Date();
      campaign.creators[creatorIndex].bannedReason = bannedReason || 'No reason provided';
    } else if (action === 'restore') {
      // Restore creator
      campaign.creators[creatorIndex].status = 'active';
      campaign.creators[creatorIndex].bannedAt = null;
      campaign.creators[creatorIndex].bannedReason = '';
    } else if (action === 'update-status' && status) {
      // Update status directly
      campaign.creators[creatorIndex].status = status;
      if (status === 'active') {
        campaign.creators[creatorIndex].bannedAt = null;
        campaign.creators[creatorIndex].bannedReason = '';
      }
    }

    await campaign.save();

    return Response.json(
      {
        success: true,
        message: `Creator ${action} successful`,
        campaign: campaign,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update creator error:', error);
    return Response.json(
      { success: false, message: 'Failed to update creator' },
      { status: 500 }
    );
  }
}

// PATCH - Remove creator from campaign entirely
export async function PATCH(req, { params }) {
  await connectDB();

  try {
    const { id: campaignId, creatorId } = params;
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = verifyToken(token);
    const user = await User.findById(userId);

    if (!user || !['admin', 'brand'].includes(user.role)) {
      return Response.json(
        { success: false, message: 'Only admins and brands can remove creators' },
        { status: 403 }
      );
    }

    // Verify campaign exists and user has permission
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return Response.json(
        { success: false, message: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Brands can only manage creators in their campaigns
    if (user.role === 'brand' && campaign.createdBy.toString() !== userId) {
      return Response.json(
        { success: false, message: 'You can only remove creators from campaigns you created' },
        { status: 403 }
      );
    }

    // Remove creator from campaign
    campaign.creators = campaign.creators.filter(
      (c) => c.creatorId?.toString() !== creatorId
    );

    await campaign.save();

    return Response.json(
      {
        success: true,
        message: 'Creator removed from campaign',
        campaign: campaign,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Remove creator error:', error);
    return Response.json(
      { success: false, message: 'Failed to remove creator' },
      { status: 500 }
    );
  }
}
