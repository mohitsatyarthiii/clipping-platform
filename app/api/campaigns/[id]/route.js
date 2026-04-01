import connectDB from '@/lib/db';
import Campaign from '@/models/Campaign';
import { verifyToken } from '@/lib/jwtService';
import User from '@/models/User';
import mongoose from 'mongoose';

// GET campaign by ID
export async function GET(req, { params }) {
  try {
    await connectDB();
    
    // Await params to ensure it's resolved
    const { id } = await params;
    
    console.log('Fetching campaign with ID:', id);
    console.log('ID length:', id?.length);
    console.log('ID is valid ObjectId:', mongoose.Types.ObjectId.isValid(id));

    // Validate MongoDB ObjectId format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.log('Invalid ObjectId format:', id);
      return Response.json(
        { 
          success: false, 
          message: 'Invalid campaign ID format',
          receivedId: id 
        },
        { status: 400 }
      );
    }

    // Get auth token - optional
    let userId = null;
    let userRole = null;
    const authHeader = req.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        userId = decoded.userId;
        
        const user = await User.findById(userId).select('role');
        if (user) {
          userRole = user.role;
        }
      } catch (error) {
        console.log('Token verification failed:', error.message);
      }
    }

    // Find campaign
    const campaign = await Campaign.findById(id)
      .select('-__v')
      .populate('createdBy', 'name email profileImage')
      .populate('creators.creatorId', 'name email profileImage role bio');

    if (!campaign) {
      console.log('Campaign not found for ID:', id);
      return Response.json(
        { 
          success: false, 
          message: 'Campaign not found',
          campaignId: id 
        },
        { status: 404 }
      );
    }

    // Convert to plain object
    const campaignData = campaign.toObject();

    // For creators, show if they've already joined
    if (userId && userRole === 'creator') {
      const hasJoined = campaignData.creators?.some(
        creator => creator.creatorId?._id?.toString() === userId
      );
      campaignData.hasJoined = hasJoined;
    }

    console.log('Campaign found successfully:', campaignData.title);
    
    return Response.json(
      {
        success: true,
        campaign: campaignData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get campaign error:', error);
    return Response.json(
      { 
        success: false, 
        message: 'Failed to fetch campaign', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// PUT - Update campaign or manage creators
export async function PUT(req, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = verifyToken(token);
    const user = await User.findById(userId);

    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Validate campaign ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { success: false, message: 'Invalid campaign ID format' },
        { status: 400 }
      );
    }

    // Find campaign
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return Response.json(
        { success: false, message: 'Campaign not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { action, ...updateData } = body;

    // Handle creator management actions
    if (action) {
      // Check permissions for creator management
      if (user.role !== 'admin' && campaign.createdBy.toString() !== userId) {
        return Response.json(
          { success: false, message: 'You don\'t have permission to manage creators in this campaign' },
          { status: 403 }
        );
      }

      const { creatorId } = updateData;

      switch (action) {
        case 'join':
          // Allow creator to join campaign
          if (user.role !== 'creator') {
            return Response.json(
              { success: false, message: 'Only creators can join campaigns' },
              { status: 403 }
            );
          }

          // Check if campaign is active
          if (campaign.status !== 'active') {
            return Response.json(
              { success: false, message: 'Cannot join inactive campaign' },
              { status: 400 }
            );
          }

          // Check if already joined
          const alreadyJoined = campaign.creators?.some(
            c => c.creatorId?.toString() === userId
          );

          if (alreadyJoined) {
            return Response.json(
              { success: false, message: 'You have already joined this campaign' },
              { status: 400 }
            );
          }

          // Add creator to campaign
          campaign.creators.push({
            creatorId: userId,
            joinedAt: new Date(),
            status: 'active',
            stats: { views: 0, clicks: 0, conversions: 0 },
            earnings: { total: 0, pending: 0, paid: 0 },
            platformLinks: {}
          });

          await campaign.save();
          
          return Response.json(
            { success: true, message: 'Successfully joined campaign' },
            { status: 200 }
          );

        case 'leave':
          // Allow creator to leave campaign
          if (user.role !== 'creator') {
            return Response.json(
              { success: false, message: 'Only creators can leave campaigns' },
              { status: 403 }
            );
          }

          // Check if creator is in campaign
          const creatorIndex = campaign.creators.findIndex(
            c => c.creatorId?.toString() === userId
          );

          if (creatorIndex === -1) {
            return Response.json(
              { success: false, message: 'You are not part of this campaign' },
              { status: 400 }
            );
          }

          // Remove creator from campaign
          campaign.creators.splice(creatorIndex, 1);
          await campaign.save();
          
          return Response.json(
            { success: true, message: 'Successfully left campaign' },
            { status: 200 }
          );

        case 'update-links':
          // Update creator's platform links
          const creatorToUpdate = campaign.creators.find(
            c => c.creatorId?.toString() === creatorId
          );

          if (!creatorToUpdate) {
            return Response.json(
              { success: false, message: 'Creator not found in campaign' },
              { status: 404 }
            );
          }

          creatorToUpdate.platformLinks = updateData.platformLinks;
          await campaign.save();
          
          return Response.json(
            { success: true, message: 'Creator links updated successfully' },
            { status: 200 }
          );

        case 'ban':
          // Ban creator from campaign
          const creatorToBan = campaign.creators.find(
            c => c.creatorId?.toString() === creatorId
          );

          if (!creatorToBan) {
            return Response.json(
              { success: false, message: 'Creator not found in campaign' },
              { status: 404 }
            );
          }

          creatorToBan.status = 'banned';
          creatorToBan.bannedReason = updateData.bannedReason;
          creatorToBan.bannedAt = new Date();
          await campaign.save();
          
          return Response.json(
            { success: true, message: 'Creator banned successfully' },
            { status: 200 }
          );

        case 'restore':
          // Restore banned creator
          const creatorToRestore = campaign.creators.find(
            c => c.creatorId?.toString() === creatorId
          );

          if (!creatorToRestore) {
            return Response.json(
              { success: false, message: 'Creator not found in campaign' },
              { status: 404 }
            );
          }

          creatorToRestore.status = 'active';
          creatorToRestore.bannedReason = undefined;
          creatorToRestore.bannedAt = undefined;
          await campaign.save();
          
          return Response.json(
            { success: true, message: 'Creator restored successfully' },
            { status: 200 }
          );

        case 'remove':
          // Remove creator from campaign
          const removeIndex = campaign.creators.findIndex(
            c => c.creatorId?.toString() === creatorId
          );

          if (removeIndex === -1) {
            return Response.json(
              { success: false, message: 'Creator not found in campaign' },
              { status: 404 }
            );
          }

          campaign.creators.splice(removeIndex, 1);
          await campaign.save();
          
          return Response.json(
            { success: true, message: 'Creator removed successfully' },
            { status: 200 }
          );

        default:
          return Response.json(
            { success: false, message: 'Invalid action' },
            { status: 400 }
          );
      }
    }

    // Handle campaign updates (admins and the campaign owner)
    if (user.role !== 'admin' && campaign.createdBy.toString() !== userId) {
      return Response.json(
        { success: false, message: 'You don\'t have permission to update this campaign' },
        { status: 403 }
      );
    }

    const {
      title,
      description,
      payoutPer1000Views,
      rules,
      startDate,
      endDate,
      banner,
      status
    } = updateData;

    // Update campaign fields
    if (title) campaign.title = title.trim();
    if (description) campaign.description = description.trim();
    if (payoutPer1000Views) campaign.payoutPer1000Views = parseFloat(payoutPer1000Views);
    if (rules !== undefined) campaign.rules = rules ? rules.trim() : '';
    if (startDate) campaign.startDate = new Date(startDate);
    if (endDate) campaign.endDate = new Date(endDate);
    if (banner !== undefined) campaign.banner = banner;
    if (status) campaign.status = status;

    await campaign.save();

    return Response.json(
      {
        success: true,
        message: 'Campaign updated successfully',
        campaign
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update campaign error:', error);
    return Response.json(
      { success: false, message: 'Failed to update campaign', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE campaign
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
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

    // Validate campaign ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { success: false, message: 'Invalid campaign ID format' },
        { status: 400 }
      );
    }

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