import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Submission from '../models/Submission.js';
import ViewHistory from '../models/ViewHistory.js';
import User from '../models/User.js';
import Campaign from '../models/Campaign.js';
import { getVideoViews } from './youtubeService.js';
import {
  updateSubmissionEarnings,
  calculateEarnings,
  updateUserEarnings,
} from './earningsService.js';
import {
  createNotification,
  notificationTemplates,
} from './notificationService.js';
import connectDB from './db.js';

dotenv.config();

const WORKER_INTERVAL = parseInt(process.env.WORKER_INTERVAL) || 5 * 60 * 1000; // 5 minutes
const WORKER_TIMEOUT = parseInt(process.env.WORKER_TIMEOUT) || 60000; // 1 minute

class YouTubeWorker {
  constructor() {
    this.isRunning = false;
    this.failureCount = 0;
    this.successCount = 0;
  }

  async start() {
    if (this.isRunning) {
      console.log('Worker is already running');
      return;
    }

    console.log('✓ YouTube Worker started');
    await connectDB();
    this.isRunning = true;

    this.intervalId = setInterval(() => {
      this.run();
    }, WORKER_INTERVAL);

    // Run once immediately
    await this.run();
  }

  async stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.isRunning = false;
    console.log('✓ YouTube Worker stopped');
  }

  async run() {
    try {
      console.log(`\n[${new Date().toISOString()}] Running YouTube Worker...`);

      // Get all approved submissions that need view updates
      const submissions = await Submission.find({
        status: 'approved',
      })
        .populate('campaignId')
        .populate('userId');

      let updatedCount = 0;
      let errorCount = 0;

      for (const submission of submissions) {
        try {
          await this.updateSubmissionViews(submission);
          updatedCount++;
        } catch (error) {
          console.error(
            `Failed to update views for submission ${submission._id}:`,
            error.message
          );
          errorCount++;
        }
      }

      console.log(
        `✓ Worker completed: ${updatedCount} updated, ${errorCount} errors`
      );
      this.successCount++;
    } catch (error) {
      console.error('Worker error:', error);
      this.failureCount++;
    }
  }

  async updateSubmissionViews(submission) {
    try {
      // Skip if no video ID
      if (!submission.youtubeVideoId) {
        return;
      }

      // Fetch current views from YouTube
      const videoStats = await getVideoViews(submission.youtubeVideoId);

      const oldViews = submission.views;
      const newViews = videoStats.views;

      // Only update if views changed
      if (newViews === oldViews) {
        return;
      }

      // Update submission views
      submission.views = newViews;
      submission.lastViewFetch = new Date();

      // Recalculate earnings
      const newEarnings = calculateEarnings(
        newViews,
        submission.campaignId.payoutPer1000Views
      );
      const oldEarnings = submission.earnings;
      submission.earnings = newEarnings;

      await submission.save();

      // Update view history
      await ViewHistory.create({
        submissionId: submission._id,
        views: newViews,
      });

      // Update user earnings if changed
      if (newEarnings > oldEarnings) {
        const earningsDiff = newEarnings - oldEarnings;
        submission.userId.earnings.pending += earningsDiff;
        submission.userId.earnings.total += earningsDiff;
        await submission.userId.save();

        // Send notification if significant earning change (> $5)
        if (earningsDiff > 5) {
          await createNotification(
            submission.userId._id,
            ...Object.values(notificationTemplates.earningsUpdated(earningsDiff)),
            {
              entityType: 'submission',
              entityId: submission._id,
            }
          );
        }
      }

      // Update campaign metrics
      await Campaign.findByIdAndUpdate(submission.campaignId._id, {
        $inc: { 'metrics.totalViews': newViews - oldViews },
      });

      console.log(
        `  → Submission ${submission._id}: ${oldViews} → ${newViews} views, earnings: $${oldEarnings.toFixed(2)} → $${newEarnings.toFixed(2)}`
      );
    } catch (error) {
      console.error(`Update views error for ${submission._id}:`, error.message);
      throw error;
    }
  }

  getStats() {
    return {
      isRunning: this.isRunning,
      successCount: this.successCount,
      failureCount: this.failureCount,
      interval: WORKER_INTERVAL,
    };
  }
}

// Singleton instance
let workerInstance = null;

export function getWorker() {
  if (!workerInstance) {
    workerInstance = new YouTubeWorker();
  }
  return workerInstance;
}

// Start worker if running as main process
if (import.meta.url === `file://${process.argv[1]}`) {
  const worker = getWorker();

  worker.start().catch((error) => {
    console.error('Failed to start worker:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await worker.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await worker.stop();
    process.exit(0);
  });
}

export default YouTubeWorker;
