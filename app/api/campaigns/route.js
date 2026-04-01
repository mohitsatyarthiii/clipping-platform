// app/api/campaigns/route.js - Complete updated version
import connectDB from '@/lib/db';
import Campaign from '@/models/Campaign';
import { verifyToken } from '@/lib/jwtService';
import User from '@/models/User';

// GET all campaigns
export async function GET(req) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sort') || '-createdAt';
    const createdByMe = searchParams.get('createdByMe') === 'true';
    const joinedByMe = searchParams.get('joinedByMe') === 'true';

    const skip = (page - 1) * limit;

    let userId = null;
    let userRole = null;
    const authHeader = req.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const { userId: authUserId } = verifyToken(token);
        userId = authUserId;
        
        const user = await User.findById(userId);
        if (user) {
          userRole = user.role;
        }
      } catch (error) {
        console.log('Token verification failed:', error.message);
      }
    }

    const filter = {};
    
    if (status) {
      filter.status = status;
    } else {
      if (userRole !== 'admin' && userRole !== 'brand' && !createdByMe && !joinedByMe) {
        filter.status = 'active';
      }
    }
    
    if (createdByMe && userId) {
      filter.createdBy = userId;
    }
    
    if (joinedByMe && userId) {
      filter['creators.creatorId'] = userId;
    }

    const [campaigns, total] = await Promise.all([
      Campaign.find(filter)
        .select('-__v')
        .populate('createdBy', 'name email profileImage')
        .populate('creators.creatorId', 'name email profileImage role')
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .lean(),
      Campaign.countDocuments(filter),
    ]);

    if (userId && userRole === 'creator') {
      campaigns.forEach(campaign => {
        campaign.hasJoined = campaign.creators?.some(
          creator => creator.creatorId?._id?.toString() === userId
        );
      });
    }

    return Response.json(
      {
        success: true,
        campaigns,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get campaigns error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// CREATE campaign with source links
export async function POST(req) {
  await connectDB();

  try {
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
        { success: false, message: 'Only admins and brands can create campaigns' },
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
      sourceLinks, // Add sourceLinks here
    } = await req.json();

    if (!title || !description || !payoutPer1000Views) {
      return Response.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const payoutAmount = parseFloat(payoutPer1000Views);

    if (isNaN(payoutAmount) || payoutAmount <= 0) {
      return Response.json(
        { success: false, message: 'Payout must be a valid number greater than 0' },
        { status: 400 }
      );
    }

    const campaign = await Campaign.create({
      title: title.trim(),
      description: description.trim(),
      payoutPer1000Views: payoutAmount,
      rules: rules ? rules.trim() : '',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      banner: banner || null,
      sourceLinks: sourceLinks || [], // Save source links
      createdBy: userId,
      status: 'active',
      creators: [],
    });

    return Response.json(
      {
        success: true,
        message: 'Campaign created successfully',
        campaign,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create campaign error:', error);
    
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
      { success: false, message: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}