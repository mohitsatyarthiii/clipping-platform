// app/api/campaigns/route.js - Complete fixed version
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

    const body = await req.json();
    console.log('📦 Received body:', JSON.stringify(body, null, 2)); // Debug log
    
    const {
      title,
      description,
      payoutPer1000Views,
      rules,
      startDate,
      endDate,
      banner,
      sourceLinks,
    } = body;

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

    // Clean source links - remove any invalid ones
    const cleanedSourceLinks = (sourceLinks || [])
      .filter(link => link.title && link.url) // Only keep links with both title and URL
      .map(link => ({
        title: link.title.trim(),
        url: link.url.trim(),
        description: link.description || '',
        type: link.type || 'other'
      }));
    
    console.log('📦 Cleaned source links:', cleanedSourceLinks); // Debug log

    const campaignData = {
      title: title.trim(),
      description: description.trim(),
      payoutPer1000Views: payoutAmount,
      rules: rules ? rules.trim() : '',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      banner: banner || null,
      sourceLinks: cleanedSourceLinks,
      createdBy: userId,
      status: 'active',
      creators: [],
    };
    
    console.log('📦 Campaign data to save:', JSON.stringify(campaignData, null, 2)); // Debug log

    const campaign = await Campaign.create(campaignData);
    
    console.log('✅ Campaign created successfully with ID:', campaign._id);
    console.log('✅ Source links saved:', campaign.sourceLinks);

    return Response.json(
      {
        success: true,
        message: 'Campaign created successfully',
        campaign,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Create campaign error:', error);
    
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
      { success: false, message: 'Failed to create campaign', error: error.message },
      { status: 500 }
    );
  }
}