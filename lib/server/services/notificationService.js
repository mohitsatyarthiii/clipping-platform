import Notification from '../../../models/Notification.js';

export const createNotification = async (
  userId,
  title,
  message,
  type = 'info',
  action = null,
  relatedEntity = null
) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      action,
      relatedEntity: relatedEntity || {},
    });

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
};

export const getUserNotifications = async (userId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ userId });

    return {
      notifications,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    throw error;
  }
};

export const getUnreadCount = async (userId) => {
  try {
    const count = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    return count;
  } catch (error) {
    console.error('Failed to get unread count:', error);
    throw error;
  }
};

export const markAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    return notification;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
};

export const markAllAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    return result;
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    await Notification.findByIdAndDelete(notificationId);
    return true;
  } catch (error) {
    console.error('Failed to delete notification:', error);
    throw error;
  }
};

export const deleteAllUserNotifications = async (userId) => {
  try {
    await Notification.deleteMany({ userId });
    return true;
  } catch (error) {
    console.error('Failed to delete all notifications:', error);
    throw error;
  }
};

// Notification templates
export const notificationTemplates = {
  joinApproved: (campaignTitle) => ({
    title: 'Join Request Approved ✅',
    message: `Your request to join "${campaignTitle}" has been approved!`,
    type: 'success',
    action: 'join_approved',
  }),

  joinRejected: (campaignTitle, reason) => ({
    title: 'Join Request Rejected ❌',
    message: `Your request to join "${campaignTitle}" was rejected. ${reason ? `Reason: ${reason}` : ''}`,
    type: 'warning',
    action: 'join_rejected',
  }),

  submissionApproved: (campaignTitle) => ({
    title: 'Submission Approved ✅',
    message: `Your submission for "${campaignTitle}" has been approved!`,
    type: 'success',
    action: 'submission_approved',
  }),

  submissionRejected: (campaignTitle, reason) => ({
    title: 'Submission Rejected ❌',
    message: `Your submission for "${campaignTitle}" was rejected. ${reason ? `Reason: ${reason}` : ''}`,
    type: 'warning',
    action: 'submission_rejected',
  }),

  earningsUpdated: (amount) => ({
    title: 'Earnings Updated 💰',
    message: `Your earnings have been updated by $${amount.toFixed(2)}`,
    type: 'success',
    action: 'earnings_updated',
  }),

  campaignCreated: (campaignTitle) => ({
    title: 'Campaign Created 🚀',
    message: `Campaign "${campaignTitle}" has been created successfully!`,
    type: 'success',
    action: 'campaign_created',
  }),

  newSubmission: (clipperId, campaignTitle) => ({
    title: 'New Submission Received 📹',
    message: `A new submission has been received for "${campaignTitle}"`,
    type: 'info',
    action: 'new_submission',
  }),

  newJoinRequest: (clipperId, campaignTitle) => ({
    title: 'New Join Request 🎬',
    message: `A new user is requesting to join "${campaignTitle}"`,
    type: 'info',
    action: 'new_join_request',
  }),
};
