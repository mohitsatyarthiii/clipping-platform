import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/middlewares/auth';
import Campaign from '@/models/Campaign';
import { getCampaignCreatorsEarnings } from '@/lib/server/services/earningsService';

/**
 * GET /api/campaigns/[id]/earnings
 * Get all creators' earnings for a specific campaign
 * Protected: Brand owner or admin only
 */
export async function GET(request, { params }) {
  try {
    await connectDB();

    const campaignId = params.id;

    // Verify authentication
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

    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return NextResponse.json(
        { message: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check authorization: only admin or campaign creator (brand)
    if (
      decoded.role !== 'admin' &&
      campaign.createdBy.toString() !== decoded.userId
    ) {
      return NextResponse.json(
        { message: 'Not authorized to view this campaign' },
        { status: 403 }
      );
    }

    // Get campaign creators earnings
    const earningsData = await getCampaignCreatorsEarnings(campaignId);

    return NextResponse.json({
      success: true,
      campaign: earningsData,
    });
  } catch (error) {
    console.error('Error fetching campaign earnings:', error);
    return NextResponse.json(
      { message: 'Failed to fetch campaign earnings', error: error.message },
      { status: 500 }
    );
  }
}
