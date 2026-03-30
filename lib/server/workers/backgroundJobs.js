import cron from 'node-cron';
import { syncAllCampaignViews } from './youtubeSyncWorker';
import connectDB from '@/lib/db';

/**
 * Cron Jobs for Automated View Synchronization
 * 
 * Schedule:
 * - Every 6 hours: Full sync of all active campaigns
 * - Every 30 minutes: Quick health check
 */

let cronJobs = [];

export function initializeBackgroundJobs() {
  try {
    console.log('[Background Jobs] Initializing background jobs...');

    // Full campaign sync every 6 hours
    // Runs at: 00:00, 06:00, 12:00, 18:00 UTC
    const fullSyncJob = cron.schedule('0 */6 * * *', async () => {
      try {
        console.log('[Background Jobs] Starting scheduled full sync...');
        await connectDB();
        const result = await syncAllCampaignViews();
        console.log('[Background Jobs] Full sync completed:', {
          synced: result.totalSynced,
          errors: result.totalErrors,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('[Background Jobs] Full sync error:', error);
      }
    });

    cronJobs.push(fullSyncJob);
    console.log('[Background Jobs] ✓ Full sync job scheduled (every 6 hours)');

    // Optional: Quick health check every 30 minutes
    const healthCheckJob = cron.schedule('*/30 * * * *', async () => {
      try {
        console.log('[Background Jobs] Health check at', new Date().toISOString());
        // Add health check logic here if needed
      } catch (error) {
        console.error('[Background Jobs] Health check error:', error);
      }
    });

    cronJobs.push(healthCheckJob);
    console.log('[Background Jobs] ✓ Health check job scheduled (every 30 minutes)');

    console.log('[Background Jobs] All background jobs initialized successfully');
    return true;
  } catch (error) {
    console.error('[Background Jobs] Initialization error:', error);
    return false;
  }
}

/**
 * Gracefully stop all cron jobs
 * Call this during server shutdown
 */
export function stopBackgroundJobs() {
  try {
    console.log('[Background Jobs] Stopping all background jobs...');
    cronJobs.forEach((job) => job.stop());
    cronJobs = [];
    console.log('[Background Jobs] All jobs stopped');
  } catch (error) {
    console.error('[Background Jobs] Error stopping jobs:', error);
  }
}

/**
 * Get status of all background jobs
 */
export function getBackgroundJobsStatus() {
  return {
    totalJobs: cronJobs.length,
    jobs: cronJobs.map((job, index) => ({
      id: index,
      status: job.status,
      schedule: job.nextDate().toISOString(),
    })),
    initialized: cronJobs.length > 0,
  };
}
