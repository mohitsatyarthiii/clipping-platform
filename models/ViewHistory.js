import mongoose from 'mongoose';

const viewHistorySchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
    },
    views: {
      type: Number,
      required: true,
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

viewHistorySchema.index({ submissionId: 1, fetchedAt: 1 });

const ViewHistory =
  mongoose.models.ViewHistory ||
  mongoose.model('ViewHistory', viewHistorySchema);

export default ViewHistory;
