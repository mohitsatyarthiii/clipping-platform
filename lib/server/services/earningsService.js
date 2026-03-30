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
/**
 * Campaign Creator Earnings Functions (New System)
 * For the new campaign-creator relationship model
 */

/**
 * Calculate and update creator earnings on a campaign
 */
export const updateCampaignCreatorEarnings = async (
  campaignId,
  creatorId,
  newViewCount
) => {
  try {
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Find the creator in the campaign
    const creatorIndex = campaign.creators.findIndex(
      (c) => c.creatorId.toString() === creatorId
    );

    if (creatorIndex === -1) {
      throw new Error('Creator not found in campaign');
    }

    const creator = campaign.creators[creatorIndex];
    const oldEarnings = creator.earnings.total;

    // Calculate new earnings
    const newEarnings = calculateEarnings(
      newViewCount,
      campaign.payoutPer1000Views
    );

    // Update creator stats and earnings
    creator.stats = {
      ...creator.stats,
      views: newViewCount,
      lastSyncedAt: new Date(),
      syncStatus: 'completed',
      syncError: null,
    };

    creator.earnings = {
      total: newEarnings,
      pending: Math.max(0, newEarnings - (creator.earnings.paid || 0)),
      paid: creator.earnings.paid || 0,
      lastCalculatedAt: new Date(),
    };

    campaign.creators[creatorIndex] = creator;
    await campaign.save();

    // Notification if earnings increased significantly
    if (newEarnings > oldEarnings + 1) {
      // Only notify for changes > $1
      await createNotification(
        creatorId,
        `earnings_updated_${campaignId}`,
        `You earned $${(newEarnings - oldEarnings).toFixed(2)} on ${campaign.title}`,
        'earnings',
        { campaignId, amount: newEarnings - oldEarnings }
      );
    }

    return creator;
  } catch (error) {
    console.error('Failed to update campaign creator earnings:', error);
    throw error;
  }
};

/**
 * Get creator earnings across all campaigns
 */
export const getCreatorCampaignEarnings = async (creatorId) => {
  try {
    const campaigns = await Campaign.find({
      'creators.creatorId': creatorId,
    })
      .select('title _id payoutPer1000Views status creators')
      .lean();

    const earningsBreakdown = [];
    let totalEarnings = 0;
    let totalPending = 0;
    let totalViews = 0;

    campaigns.forEach((campaign) => {
      const creator = campaign.creators.find(
        (c) => c.creatorId.toString() === creatorId
      );

      if (creator) {
        const earnings = creator.earnings.total || 0;
        const pending = creator.earnings.pending || 0;
        const views = creator.stats.views || 0;

        totalEarnings += earnings;
        totalPending += pending;
        totalViews += views;

        earningsBreakdown.push({
          campaignId: campaign._id,
          campaignName: campaign.title,
          payoutRate: campaign.payoutPer1000Views,
          views,
          earnings,
          pending,
          paid: creator.earnings.paid || 0,
          status: campaign.status,
          joinedAt: creator.joinedAt,
        });
      }
    });

    return {
      creatorId,
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      totalPending: parseFloat(totalPending.toFixed(2)),
      totalViews,
      campaignCount: earningsBreakdown.length,
      earnings: earningsBreakdown,
    };
  } catch (error) {
    console.error('Failed to get creator campaign earnings:', error);
    throw error;
  }
};

/**
 * Get campaign creators earnings summary
 */
export const getCampaignCreatorsEarnings = async (campaignId) => {
  try {
    const campaign = await Campaign.findById(campaignId)
      .populate('creators.creatorId', 'name email profileImage')
      .select('title payoutPer1000Views creators');

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const creators = campaign.creators.map((creator) => ({
      creatorId: creator.creatorId._id,
      creatorName: creator.creatorId.name,
      creatorEmail: creator.creatorId.email,
      profileImage: creator.creatorId.profileImage,
      views: creator.stats.views || 0,
      earnings: creator.earnings.total || 0,
      pending: creator.earnings.pending || 0,
      paid: creator.earnings.paid || 0,
      joinedAt: creator.joinedAt,
      platformLinks: creator.platformLinks,
    }));

    const totalEarnings = creators.reduce((sum, c) => sum + c.earnings, 0);
    const totalViews = creators.reduce((sum, c) => sum + c.views, 0);

    // Sort by earnings descending
    creators.sort((a, b) => b.earnings - a.earnings);

    return {
      campaignId,
      campaignTitle: campaign.title,
      payoutRate: campaign.payoutPer1000Views,
      creators,
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      totalPending: creators.reduce((sum, c) => sum + c.pending, 0),
      totalPaid: creators.reduce((sum, c) => sum + c.paid, 0),
      totalViews,
      creatorCount: creators.length,
      averageEarningsPerCreator:
        creators.length > 0
          ? parseFloat((totalEarnings / creators.length).toFixed(2))
          : 0,
      averageViewsPerCreator:
        creators.length > 0 ? Math.floor(totalViews / creators.length) : 0,
    };
  } catch (error) {
    console.error('Failed to get campaign creators earnings:', error);
    throw error;
  }
};

/**
 * Mark creator earnings as paid on a campaign
 */
export const markCreatorEarningsAsPaid = async (
  campaignId,
  creatorId,
  amountToPay
) => {
  try {
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const creatorIndex = campaign.creators.findIndex(
      (c) => c.creatorId.toString() === creatorId
    );

    if (creatorIndex === -1) {
      throw new Error('Creator not found in campaign');
    }

    const creator = campaign.creators[creatorIndex];
    const pendingEarnings = creator.earnings.pending || 0;
    const actualPayment = Math.min(amountToPay, pendingEarnings);

    creator.earnings.pending = pendingEarnings - actualPayment;
    creator.earnings.paid = (creator.earnings.paid || 0) + actualPayment;

    campaign.creators[creatorIndex] = creator;
    await campaign.save();

    // Notification
    await createNotification(
      creatorId,
      `payment_processed_${campaignId}`,
      `Payment of $${actualPayment.toFixed(2)} processed for ${campaign.title}`,
      'payment',
      { campaignId, amount: actualPayment }
    );

    return creator;
  } catch (error) {
    console.error('Failed to mark creator earnings as paid:', error);
    throw error;
  }
};