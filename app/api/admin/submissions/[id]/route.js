import connectDB from '@/lib/db';
import Submission from '@/models/Submission';
import { verifyToken } from '@/lib/jwtService';
import User from '@/models/User';
import {
  createNotification,
  notificationTemplates,
} from '@/lib/server/services/notificationService';
import { updateUserEarnings, updateSubmissionEarnings } from '@/lib/server/services/earningsService';

export async function PUT(req, { params }) {
  await connectDB();

  try {
    const { id: submissionId } = params;
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

    const submission = await Submission.findById(submissionId).populate([
      'userId',
      'campaignId',
    ]);

    if (!submission) {
      return Response.json(
        { success: false, message: 'Submission not found' },
        { status: 404 }
      );
    }

    if (submission.status !== 'pending') {
      return Response.json(
        { success: false, message: 'This submission has already been reviewed' },
        { status: 409 }
      );
    }

    // Update submission
    submission.status = action === 'approve' ? 'approved' : 'rejected';
    submission.reviewedBy = adminId;
    submission.reviewedAt = new Date();
    if (action === 'reject' && rejectionReason) {
      submission.rejectionReason = rejectionReason;
    }

    // If approved, calculate and update earnings
    if (action === 'approve') {
      await updateSubmissionEarnings(submissionId);
    }

    await submission.save();

    // Send notification to user
    if (action === 'approve') {
      await createNotification(
        submission.userId._id,
        ...Object.values(
          notificationTemplates.submissionApproved(submission.campaignId.title)
        ),
        {
          entityType: 'submission',
          entityId: submission._id,
        }
      );
    } else {
      await createNotification(
        submission.userId._id,
        ...Object.values(
          notificationTemplates.submissionRejected(
            submission.campaignId.title,
            rejectionReason
          )
        ),
        {
          entityType: 'submission',
          entityId: submission._id,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: `Submission ${action}ed successfully`,
        submission,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Review submission error:', error);
    return Response.json(
      { success: false, message: 'Failed to review submission' },
      { status: 500 }
    );
  }
}
