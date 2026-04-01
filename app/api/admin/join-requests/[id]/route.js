import connectDB from '@/lib/db';
import CampaignJoinRequest from '@/models/CampaignJoinRequest';
import Campaign from '@/models/Campaign';
import { verifyToken } from '@/lib/jwtService';
import User from '@/models/User';
import {
  createNotification,
  notificationTemplates,
} from '@/lib/server/services/notificationService';

export async function PUT(req, { params }) {
  await connectDB();

  try {
    const { id: requestId } = params;
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId: adminId } = verifyToken(token);
    const admin = await User.findById(adminId);

    if (!admin || admin.role !== 'admin') {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { action, rejectionReason } = await req.json();

    if (!action || !['approve', 'reject'].includes(action)) {
      return Response.json(
        { success: false, message: 'Invalid action' },
        { status: 400 }
      );
    }

    const joinRequest = await CampaignJoinRequest.findById(requestId).populate(
      ['userId', 'campaignId']
    );

    if (!joinRequest) {
      return Response.json(
        { success: false, message: 'Join request not found' },
        { status: 404 }
      );
    }

    if (joinRequest.status !== 'pending') {
      return Response.json(
        { success: false, message: 'This request has already been reviewed' },
        { status: 409 }
      );
    }

    // Update join request
    joinRequest.status = action === 'approve' ? 'approved' : 'rejected';
    joinRequest.reviewedBy = adminId;
    joinRequest.reviewedAt = new Date();
    if (action === 'reject' && rejectionReason) {
      joinRequest.rejectionReason = rejectionReason;
    }

    await joinRequest.save();

    // Send notification to user
    if (action === 'approve') {
      await createNotification(
        joinRequest.userId._id,
        ...Object.values(
          notificationTemplates.joinApproved(joinRequest.campaignId.title)
        ),
        {
          entityType: 'campaign',
          entityId: joinRequest.campaignId._id,
        }
      );
    } else {
      await createNotification(
        joinRequest.userId._id,
        ...Object.values(
          notificationTemplates.joinRejected(
            joinRequest.campaignId.title,
            rejectionReason
          )
        ),
        {
          entityType: 'campaign',
          entityId: joinRequest.campaignId._id,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: `Join request ${action}ed successfully`,
        joinRequest,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Review join request error:', error);
    return Response.json(
      { success: false, message: 'Failed to review join request' },
      { status: 500 }
    );
  }
}
