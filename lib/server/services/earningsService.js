import Submission from '../../../models/Submission.js';
import User from '../../../models/User.js';
import Campaign from '../../../models/Campaign.js';
import {
  createNotification,
  notificationTemplates,
} from './notificationService.js';

export const calculateEarnings = (views, payoutPer1000Views) => {
  return (views / 1000) * payoutPer1000Views;
};

export const updateSubmissionEarnings = async (submissionId) => {
  try {
    const submission = await Submission.findById(submissionId).populate(
      'campaignId'
    );

    if (!submission) {
      throw new Error('Submission not found');
    }

    const oldEarnings = submission.earnings;
    const newEarnings = calculateEarnings(
      submission.views,
      submission.campaignId.payoutPer1000Views
    );

    submission.earnings = newEarnings;
    await submission.save();

    const earningsDiff = newEarnings - oldEarnings;

    if (earningsDiff > 0) {
      await updateUserEarnings(submission.userId, earningsDiff);
    }

    return submission;
  } catch (error) {
    console.error('Failed to update submission earnings:', error);
    throw error;
  }
};

export const updateUserEarnings = async (userId, amount, type = 'pending') => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (type === 'pending') {
      user.earnings.pending += amount;
      user.earnings.total += amount;
    } else if (type === 'paid') {
      user.earnings.pending -= amount;
      user.earnings.paid += amount;
    }

    await user.save();

    if (amount > 0) {
      await createNotification(
        userId,
        ...Object.values(notificationTemplates.earningsUpdated(amount))
      );
    }

    return user;
  } catch (error) {
    console.error('Failed to update user earnings:', error);
    throw error;
  }
};

export const getEarningsReport = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const submissions = await Submission.find({
      userId,
      status: 'approved',
    }).select('earnings views campaignId');

    const totalViews = submissions.reduce((sum, sub) => sum + sub.views, 0);
    const totalEarnings = submissions.reduce(
      (sum, sub) => sum + sub.earnings,
      0
    );

    return {
      userId,
      userName: user.name,
      totalEarnings,
      totalViews,
      pending: user.earnings.pending,
      paid: user.earnings.paid,
      submissionCount:
        submissions.length,
      averageEarningsPerSubmission:
        submissions.length > 0 ? totalEarnings / submissions.length : 0,
      averageViewsPerSubmission:
        submissions.length > 0 ? totalViews / submissions.length : 0,
    };
  } catch (error) {
    console.error('Failed to generate earnings report:', error);
    throw error;
  }
};

export const getCampaignEarningsReport = async (campaignId) => {
  try {
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const submissions = await Submission.find({
      campaignId,
      status: 'approved',
    }).populate('userId', 'name email');

    const totalEarnings = submissions.reduce(
      (sum, sub) => sum + sub.earnings,
      0
    );
    const totalViews = submissions.reduce((sum, sub) => sum + sub.views, 0);
    const uniqueClippers = new Set(submissions.map((s) => s.userId._id));

    return {
      campaignId,
      campaignTitle: campaign.title,
      totalSubmissions: submissions.length,
      totalEarnings,
      totalViews,
      totalClippers: uniqueClippers.size,
      submissions: submissions.map((sub) => ({
        submissionId: sub._id,
        clipperId: sub.userId._id,
        clipperName: sub.userId.name,
        views: sub.views,
        earnings: sub.earnings,
        createdAt: sub.createdAt,
      })),
      averageEarningsPerSubmission:
        submissions.length > 0 ? totalEarnings / submissions.length : 0,
      averageViewsPerSubmission:
        submissions.length > 0 ? totalViews / submissions.length : 0,
    };
  } catch (error) {
    console.error('Failed to generate campaign earnings report:', error);
    throw error;
  }
};

export const approveAndProcessEarnings = async (
  submissionId,
  adminId
) => {
  try {
    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      {
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
      { new: true }
    ).populate('campaignId userId');

    if (!submission) {
      throw new Error('Submission not found');
    }

    // Update earnings
    await updateSubmissionEarnings(submissionId);

    // Create notification
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

    return submission;
  } catch (error) {
    console.error('Failed to approve and process earnings:', error);
    throw error;
  }
};

export const getTopEarners = async (limit = 10) => {
  try {
    const topEarners = await User.find()
      .sort({ 'earnings.total': -1 })
      .limit(limit)
      .select('name profileImage earnings');

    return topEarners;
  } catch (error) {
    console.error('Failed to get top earners:', error);
    throw error;
  }
};

export const getEarningsStats = async () => {
  try {
    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          totalEarningsDistributed: { $sum: '$earnings.total' },
          totalEarningsPaid: { $sum: '$earnings.paid' },
          totalEarningsPending: { $sum: '$earnings.pending' },
          averageEarningsPerUser: { $avg: '$earnings.total' },
          userCount: { $sum: 1 },
        },
      },
    ]);

    const submissions = await Submission.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          totalViews: { $sum: '$views' },
        },
      },
    ]);

    return {
      earnings: users[0] || {
        totalEarningsDistributed: 0,
        totalEarningsPaid: 0,
        totalEarningsPending: 0,
        averageEarningsPerUser: 0,
        userCount: 0,
      },
      submissions: submissions[0] || {
        totalSubmissions: 0,
        totalViews: 0,
      },
    };
  } catch (error) {
    console.error('Failed to get earnings stats:', error);
    throw error;
  }
};
