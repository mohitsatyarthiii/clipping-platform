import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
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
    uploadedVideoUrl: {
      type: String,
      required: [true, 'Please provide uploaded video URL'],
    },
    youtubeShortUrl: {
      type: String,
      required: [true, 'Please provide YouTube Short URL'],
    },
    youtubeVideoId: {
      type: String,
      required: true,
    },
    sourceContentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SourceContent',
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
    earnings: {
      type: Number,
      default: 0,
    },
    lastViewFetch: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    isDuplicate: {
      type: Boolean,
      default: false,
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

// Comprehensive indexes for performance
submissionSchema.index({ campaignId: 1, status: 1 });
submissionSchema.index({ userId: 1, campaignId: 1 });
submissionSchema.index({ youtubeVideoId: 1, campaignId: 1 }, { unique: true });
submissionSchema.index({ userId: 1, status: 1 });
submissionSchema.index({ campaignId: 1 });
submissionSchema.index({ userId: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ createdAt: -1 });
submissionSchema.index({ youtubeVideoId: 1 });
submissionSchema.index({ isDuplicate: 1 });

const Submission =
  mongoose.models.Submission ||
  mongoose.model('Submission', submissionSchema);

export default Submission;
