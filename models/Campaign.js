import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a campaign title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    payoutPer1000Views: {
      type: Number,
      required: [true, 'Please provide payout amount'],
      min: [0.01, 'Payout must be greater than 0'],
    },
    rules: {
      type: String,
      default: '',
      maxlength: [2000, 'Rules cannot exceed 2000 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'paused', 'completed'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    maxClippers: {
      type: Number,
      default: null, // null means unlimited
    },
    currentClippers: {
      type: Number,
      default: 0,
    },
    metrics: {
      totalSubmissions: {
        type: Number,
        default: 0,
      },
      totalViews: {
        type: Number,
        default: 0,
      },
      totalEarningsPaid: {
        type: Number,
        default: 0,
      },
    },
    banner: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for query optimization
campaignSchema.index({ status: 1, createdBy: 1 });
campaignSchema.index({ startDate: 1, endDate: 1 });
campaignSchema.index({ status: 1 });
campaignSchema.index({ createdBy: 1 });
campaignSchema.index({ createdAt: -1 });
campaignSchema.index({ status: 1, endDate: 1 });

const Campaign =
  mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);

export default Campaign;
