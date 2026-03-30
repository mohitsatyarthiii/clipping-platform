import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a notification title'],
    },
    message: {
      type: String,
      required: [true, 'Please provide a notification message'],
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedEntity: {
      type: {
        entityType: {
          type: String,
          enum: ['campaign', 'submission', 'joinRequest', 'earnings'],
          default: null,
        },
        entityId: {
          type: mongoose.Schema.Types.ObjectId,
          default: null,
        },
      },
      default: {},
    },
    action: {
      type: String,
      enum: [
        'join_approved',
        'join_rejected',
        'submission_approved',
        'submission_rejected',
        'earnings_updated',
        'campaign_created',
        'new_submission',
        'new_join_request',
      ],
      default: null,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification =
  mongoose.models.Notification ||
  mongoose.model('Notification', notificationSchema);

export default Notification;
