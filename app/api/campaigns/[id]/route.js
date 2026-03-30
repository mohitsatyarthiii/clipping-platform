import connectDB from '@/lib/db';
import Campaign from '@/models/Campaign';
import { verifyToken } from '@/lib/jwtService';
import User from '@/models/User';

// UPDATE campaign (admin can update any, brands can update their own)
export async function PUT(req, { params }) {
  await connectDB();

  try {
    const { id } = params;
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = verifyToken(token);
    const user = await User.findById(userId);

    if (!user || !['admin', 'brand'].includes(user.role)) {
      return Response.json(
        { success: false, message: 'Only admins and brands can update campaigns' },
        { status: 403 }
      );
    }

    // Verify campaign exists and user has permission
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return Response.json(
        { success: false, message: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Brands can only update their own campaigns
    if (user.role === 'brand' && campaign.createdBy.toString() !== userId) {
      return Response.json(
        { success: false, message: 'You can only update campaigns you created' },
        { status: 403 }
      );
    }

    const {
      title,
      description,
      payoutPer1000Views,
      rules,
      maxClippers,
      startDate,
      endDate,
      banner,
    } = await req.json();

    if (!title || !description || !payoutPer1000Views) {
      return Response.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert string values to proper types
    const payoutAmount = parseFloat(payoutPer1000Views);
    const maxClippersCount = maxClippers ? parseInt(maxClippers, 10) : null;

    if (isNaN(payoutAmount) || payoutAmount <= 0) {
      return Response.json(
        { success: false, message: 'Payout must be a valid number greater than 0' },
        { status: 400 }
      );
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        description: description.trim(),
        payoutPer1000Views: payoutAmount,
        rules: rules ? rules.trim() : '',
        maxClippers: maxClippersCount,
        startDate: startDate ? new Date(startDate) : campaign.startDate,
        endDate: endDate ? new Date(endDate) : campaign.endDate,
        banner: banner || null,
      },
      { new: true, runValidators: true }
    );

    return Response.json(
      {
        success: true,
        message: 'Campaign updated successfully',
        campaign: updatedCampaign,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update campaign error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map((err) => err.message)
        .join(', ');
      return Response.json(
        { success: false, message: `Validation error: ${messages}` },
        { status: 400 }
      );
    }

    return Response.json(
      { success: false, message: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

// DELETE campaign (admin can delete any, brands can delete their own)
export async function DELETE(req, { params }) {
  await connectDB();

  try {
    const { id } = params;
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = verifyToken(token);
    const user = await User.findById(userId);

    if (!user || !['admin', 'brand'].includes(user.role)) {
      return Response.json(
        { success: false, message: 'Only admins and brands can delete campaigns' },
        { status: 403 }
      );
    }

    // Verify campaign exists and user has permission
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return Response.json(
        { success: false, message: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Brands can only delete their own campaigns
    if (user.role === 'brand' && campaign.createdBy.toString() !== userId) {
      return Response.json(
        { success: false, message: 'You can only delete campaigns you created' },
        { status: 403 }
      );
    }

    await Campaign.findByIdAndDelete(id);

    return Response.json(
      {
        success: true,
        message: 'Campaign deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete campaign error:', error);
    return Response.json(
      { success: false, message: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
