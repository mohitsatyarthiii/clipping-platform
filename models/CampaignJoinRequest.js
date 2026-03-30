import mongoose from 'mongoose';

const campaignJoinRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Ensure unique requests per user per campaign
campaignJoinRequestSchema.index({ userId: 1, campaignId: 1 }, { unique: true });
campaignJoinRequestSchema.index({ status: 1, campaignId: 1 });
campaignJoinRequestSchema.index({ status: 1, userId: 1 });
campaignJoinRequestSchema.index({ campaignId: 1 });
campaignJoinRequestSchema.index({ userId: 1 });
campaignJoinRequestSchema.index({ createdAt: -1 });

const CampaignJoinRequest =
  mongoose.models.CampaignJoinRequest ||
  mongoose.model('CampaignJoinRequest', campaignJoinRequestSchema);

export default CampaignJoinRequest;
