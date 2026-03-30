import { NextResponse } from 'next/server';
import { authenticate } from '@/middlewares/auth';
import { syncAllCampaignViews, syncCreatorViews } from '@/lib/server/workers/youtubeSyncWorker';

/**
 * POST /api/admin/sync-views
 * Manually trigger view synchronization for all campaigns
 * Admin only
 */
export async function POST(request) {
  try {
    const authResult = await authenticate(request, 'admin');
    if (!authResult.valid) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Parse request body to check if specific campaign is requested
    const body = await request.json().catch(() => ({}));
    const { campaignId } = body;

    let result;

    if (campaignId) {
      // Sync specific campaign
      const { syncAllCampaignViews: syncCampaign } = await import('@/lib/server/workers/youtubeSyncWorker');
      result = await syncCampaign(campaignId);
    } else {
      // Sync all campaigns
      result = await syncAllCampaignViews();
    }

    return NextResponse.json({
      success: result.success !== false,
      message: campaignId ? 'Campaign view sync completed' : 'All campaigns synced',
      data: result,
    });
  } catch (error) {
    console.error('[Sync Views API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/sync-views
 * Get last sync status and history
 */
export async function GET(request) {
  try {
    const authResult = await authenticate(request, 'admin');
    if (!authResult.valid) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // This would require tracking sync history in DB
    // For now, return basic status
    return NextResponse.json({
      message: 'Sync status endpoint - tracking to be implemented',
      lastSync: null,
      status: 'ready',
    });
  } catch (error) {
    console.error('[Sync Views API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
