import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/middlewares/auth';
import Campaign from '@/models/Campaign';
import { getCreatorCampaignEarnings } from '@/lib/server/services/earningsService';

/**
 * GET /api/creator/earnings
 * Get creator's earnings across all campaigns they've joined
 * Protected: Creator only
 */
export async function GET(request) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'creator') {
      return NextResponse.json(
        { message: 'Only creators can access this' },
        { status: 403 }
      );
    }

    const creatorId = decoded.userId;

    // Get creator's earnings across all campaigns
    const earningsData = await getCreatorCampaignEarnings(creatorId);

    // Also calculate totals across all campaigns for dashboard
    const totalEarnings = earningsData.earnings.reduce(
      (sum, e) => sum + e.earnings,
      0
    );
    const totalPending = earningsData.earnings.reduce(
      (sum, e) => sum + e.pending,
      0
    );
    const totalViews = earningsData.earnings.reduce(
      (sum, e) => sum + e.views,
      0
    );

    return NextResponse.json({
      success: true,
      creatorId,
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      pendingEarnings: parseFloat(totalPending.toFixed(2)),
      paidEarnings: earningsData.earnings.reduce(
        (sum, e) => sum + e.paid,
        0
      ),
      totalViews,
      campaignCount: earningsData.campaignCount,
      byCampaign: earningsData.earnings.map((e) => ({
        campaignId: e.campaignId,
        campaignName: e.campaignName,
        views: e.views,
        earnings: e.earnings,
        pending: e.pending,
        paid: e.paid,
        payoutRate: e.payoutRate,
        status: e.status,
      })),
    });
  } catch (error) {
    console.error('Error fetching creator earnings:', error);
    return NextResponse.json(
      { message: 'Failed to fetch earnings', error: error.message },
      { status: 500 }
    );
  }
}
