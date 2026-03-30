import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/jwtService';
import Campaign from '@/models/Campaign';
import YouTubeService from '@/lib/server/services/youtubeTrackingService';
import {
  updateCampaignCreatorEarnings,
} from '@/lib/server/services/earningsService';

/**
 * POST /api/campaigns/[id]/sync-views
 * Synchronize view counts for all creators in a campaign
 * Can be called manually or by scheduled jobs
 */
export async function POST(request, { params }) {
  try {
    const db = await connectDB();

    const campaignId = params.id;

    // Verify authentication (admin or campaign creator only)
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    const campaign = await Campaign.findById(campaignId).populate(
      'createdBy',
      'email'
    );

    if (!campaign) {
      return NextResponse.json(
        { message: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check authorization: only admin or campaign creator
    if (
      decoded.role !== 'admin' &&
      campaign.createdBy._id.toString() !== decoded.userId
    ) {
      return NextResponse.json(
        { message: 'Not authorized to sync this campaign' },
        { status: 403 }
      );
    }

    const syncResults = [];
    const errors = [];

    // Sync views for each creator
    for (const creator of campaign.creators) {
      try {
        // YouTube link
        if (creator.platformLinks?.youtube) {
          const youtubeResult = await YouTubeService.getViewCount(
            creator.platformLinks.youtube
          );

          if (youtubeResult.error) {
            errors.push({
              creatorId: creator.creatorId,
              platform: 'youtube',
              error: youtubeResult.error,
            });
          } else {
            // Update creator earnings with new view count
            const updatedCreator = await updateCampaignCreatorEarnings(
              campaignId,
              creator.creatorId,
              youtubeResult.views
            );

            syncResults.push({
              creatorId: creator.creatorId,
              platform: 'youtube',
              views: youtubeResult.views,
              earnings: updatedCreator.earnings.total,
              success: true,
            });
          }
        }

        // Add support for other platforms here in the future
        // (TikTok, Instagram, etc.)
      } catch (error) {
        errors.push({
          creatorId: creator.creatorId,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      campaignId,
      campaignTitle: campaign.title,
      syncedAt: new Date(),
      results: syncResults,
      errors,
      summary: {
        totalCreators: campaign.creators.length,
        successfulSyncs: syncResults.length,
        failedSyncs: errors.length,
      },
    });
  } catch (error) {
    console.error('Error syncing campaign views:', error);
    return NextResponse.json(
      { message: 'Failed to sync views', error: error.message },
      { status: 500 }
    );
  }
}
