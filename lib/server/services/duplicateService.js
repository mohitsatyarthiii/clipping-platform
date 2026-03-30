import Submission from '../../../models/Submission';

export const checkDuplicateSubmission = async (
  youtubeVideoId,
  campaignId,
  userId
) => {
  try {
    // Check if same video ID was submitted in this campaign
    const videoIdDuplicate = await Submission.findOne({
      youtubeVideoId,
      campaignId,
    });

    if (videoIdDuplicate) {
      return {
        isDuplicate: true,
        reason: 'SAME_VIDEO_SAME_CAMPAIGN',
        message: `This YouTube video has already been submitted for this campaign by ${videoIdDuplicate.userId === userId ? 'you' : 'another clipper'}`,
        duplicateSubmissionId: videoIdDuplicate._id,
      };
    }

    // Check if same user submitted same video in this campaign (redundant but explicit)
    const userVideoSameCampaign = await Submission.findOne({
      userId,
      youtubeVideoId,
      campaignId,
    });

    if (userVideoSameCampaign) {
      return {
        isDuplicate: true,
        reason: 'USER_DUPLICATE',
        message: 'You have already submitted this video for this campaign',
        duplicateSubmissionId: userVideoSameCampaign._id,
      };
    }

    return {
      isDuplicate: false,
      reason: null,
      message: 'No duplicates found',
      duplicateSubmissionId: null,
    };
  } catch (error) {
    console.error('Failed to check duplicate submission:', error);
    throw error;
  }
};

export const checkUserDuplicateCount = async (userId, campaignId) => {
  try {
    const count = await Submission.countDocuments({
      userId,
      campaignId,
    });

    return count;
  } catch (error) {
    console.error('Failed to check user duplicate count:', error);
    throw error;
  }
};

export const getSubmissionDuplicates = async (youtubeVideoId) => {
  try {
    const duplicates = await Submission.find({
      youtubeVideoId,
    })
      .populate('userId', 'name email')
      .populate('campaignId', 'title')
      .select('_id userId campaignId createdAt status');

    return duplicates;
  } catch (error) {
    console.error('Failed to get submission duplicates:', error);
    throw error;
  }
};

export const markAsDuplicate = async (submissionId, duplicateIds = []) => {
  try {
    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      {
        isDuplicate: true,
        status: 'rejected',
        rejectionReason: 'Duplicate submission detected',
      },
      { new: true }
    );

    return submission;
  } catch (error) {
    console.error('Failed to mark submission as duplicate:', error);
    throw error;
  }
};

export const unmarkAsDuplicate = async (submissionId) => {
  try {
    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      {
        isDuplicate: false,
        status: 'pending',
        rejectionReason: null,
      },
      { new: true }
    );

    return submission;
  } catch (error) {
    console.error('Failed to unmark submission as duplicate:', error);
    throw error;
  }
};

export const getDuplicateReport = async () => {
  try {
    const duplicates = await Submission.aggregate([
      {
        $group: {
          _id: '$youtubeVideoId',
          count: { $sum: 1 },
          submissions: { $push: '$$ROOT' },
        },
      },
      {
        $match: { count: { $gt: 1 } },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    return duplicates;
  } catch (error) {
    console.error('Failed to get duplicate report:', error);
    throw error;
  }
};

export const cleanupDuplicates = async () => {
  try {
    const result = await Submission.updateMany(
      {
        isDuplicate: true,
        status: { $ne: 'rejected' },
      },
      {
        status: 'rejected',
        rejectionReason: 'Duplicate submission detected',
      }
    );

    return result;
  } catch (error) {
    console.error('Failed to cleanup duplicates:', error);
    throw error;
  }
};
