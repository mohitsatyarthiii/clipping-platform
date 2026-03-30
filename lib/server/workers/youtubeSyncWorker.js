import Campaign from '@/models/Campaign';
import YouTubeService from '@/lib/server/services/youtubeTrackingService';
import { updateCampaignCreatorEarnings } from '@/lib/server/services/earningsService';

/**
 * Background Job: Sync Views for All Active Campaigns
 * This job should be called:
 * 1. By a cron job (every 6 hours suggested)
 * 2. Manually via API
 * 3. When admin triggers manual sync
 */

export async function syncAllCampaignViews() {
  try {
    console.log(`[YouTube Sync] Starting synchronized view sync at ${new Date().toISOString()}`);

    // Find all active campaigns
    const activeCampaigns = await Campaign.find({
      status: 'active',
      'creators.0': { $exists: true }, // Has at least one creator
    }).select('_id title creators payoutPer1000Views');

    if (activeCampaigns.length === 0) {
      console.log('[YouTube Sync] No active campaigns found');
      return { synced: 0, errors: 0 };
    }

    let syncedCount = 0;
    let errorCount = 0;
    const results = [];

    for (const campaign of activeCampaigns) {
      try {
        const campaignResults = await syncCampaignViews(campaign._id);
        syncedCount += campaignResults.success;
        errorCount += campaignResults.failed;
        results.push({
          campaignId: campaign._id,
          campaignTitle: campaign.title,
          ...campaignResults,
        });
      } catch (campaignError) {
        console.error(
          `[YouTube Sync] Error syncing campaign ${campaign._id}:`,
          campaignError
        );
        errorCount++;
      }
    }

    console.log(`[YouTube Sync] Completed: ${syncedCount} synced, ${errorCount} errors`);

    return {
      success: true,
      totalCampaigns: activeCampaigns.length,
      totalSynced: syncedCount,
      totalErrors: errorCount,
      processedAt: new Date(),
      campaignResults: results,
    };
  } catch (error) {
    console.error('[YouTube Sync] Fatal error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Sync views for a single campaign
 */
export async function syncCampaignViews(campaignId) {
  try {
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    let successCount = 0;
    let failCount = 0;
    const creatorUpdates = [];

    for (const creator of campaign.creators) {
      try {
        // Only sync YouTube links for now (other platforms can be added)
        if (creator.platformLinks?.youtube) {
          creator.stats.syncStatus = 'syncing';

          const result = await YouTubeService.getViewCount(
            creator.platformLinks.youtube
          );

          if (result.error) {
            creator.stats.syncStatus = 'failed';
            creator.stats.syncError = result.error;
            failCount++;

            console.warn(
              `[YouTube Sync] Failed to get views for ${creator.creatorId}: ${result.error}`
            );
          } else {
            // Update creator earnings with new view count
            try {
              const updatedCreator = await updateCampaignCreatorEarnings(
                campaignId,
                creator.creatorId,
                result.views
              );

              successCount++;
              creatorUpdates.push({
                creatorId: creator.creatorId,
                views: result.views,
                earnings: updatedCreator.earnings.total,
              });

              console.log(
                `[YouTube Sync] Updated ${creator.creatorId}: ${result.views} views, $${updatedCreator.earnings.total.toFixed(2)} earnings`
              );
            } catch (earningsError) {
              console.error(
                `[YouTube Sync] Error updating earnings for ${creator.creatorId}:`,
                earningsError
              );
              failCount++;
            }
          }
        }
      } catch (creatorError) {
        console.error(
          `[YouTube Sync] Error syncing creator ${creator.creatorId}:`,
          creatorError
        );
        failCount++;
      }
    }

    return {
      campaignId,
      creatorCount: campaign.creators.length,
      success: successCount,
      failed: failCount,
      updates: creatorUpdates,
      syncedAt: new Date(),
    };
  } catch (error) {
    console.error(`[YouTube Sync] Campaign sync error:`, error);
    throw error;
  }
}

/**
 * Sync views for a single creator on a campaign
 * Called when creator manually requests a refresh
 */
export async function syncCreatorViews(campaignId, creatorId) {
  try {
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const creator = campaign.creators.find(
      (c) => c.creatorId.toString() === creatorId
    );

    if (!creator) {
      throw new Error('Creator not found in campaign');
    }

    if (!creator.platformLinks?.youtube) {
      throw new Error('No YouTube link found for creator');
    }

    creator.stats.syncStatus = 'syncing';

    const result = await YouTubeService.getViewCount(
      creator.platformLinks.youtube
    );

    if (result.error) {
      creator.stats.syncStatus = 'failed';
      creator.stats.syncError = result.error;
      throw new Error(`Failed to fetch views: ${result.error}`);
    }

    // Update earnings
    const updatedCreator = await updateCampaignCreatorEarnings(
      campaignId,
      creatorId,
      result.views
    );

    return {
      success: true,
      campaignId,
      creatorId,
      views: result.views,
      earnings: updatedCreator.earnings.total,
      pending: updatedCreator.earnings.pending,
      syncedAt: new Date(),
    };
  } catch (error) {
    console.error(`[YouTube Sync] Creator sync error:`, error);
    throw error;
  }
}
