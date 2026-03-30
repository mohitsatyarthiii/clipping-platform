import mongoose from 'mongoose';

const sourceContentSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    youtubeUrl: {
      type: String,
      required: [true, 'Please provide a YouTube URL'],
    },
    youtubeVideoId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      default: null,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    duration: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },
  },
  { timestamps: true }
);

sourceContentSchema.index({ campaignId: 1, status: 1 });
sourceContentSchema.index({ creatorId: 1 });
// Note: youtubeVideoId index is created automatically by unique: true on the field
sourceContentSchema.index({ creatorId: 1, campaignId: 1 });
sourceContentSchema.index({ status: 1 });
sourceContentSchema.index({ createdAt: -1 });

const SourceContent =
  mongoose.models.SourceContent ||
  mongoose.model('SourceContent', sourceContentSchema);

export default SourceContent;
