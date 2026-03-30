import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/jwtService';
import { syncAllCampaignViews, syncCampaignViews } from '@/lib/server/workers/youtubeSyncWorker';
import User from '@/models/User';

/**
 * POST /api/admin/sync-views
 * Manually trigger view synchronization for all campaigns
 * Admin only
 */
export async function POST(request) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse request body to check if specific campaign is requested
    const body = await request.json().catch(() => ({}));
    const { campaignId } = body;

    let result;

    if (campaignId) {
      result = await syncCampaignViews(campaignId);
    } else {
      result = await syncAllCampaignViews();
    }

    return Response.json({
      success: result.success !== false,
      message: campaignId ? 'Campaign view sync completed' : 'All campaigns synced',
      data: result,
    });
  } catch (error) {
    console.error('[Sync Views API] Error:', error);
    return Response.json(
      { error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}
