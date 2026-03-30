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

    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (status) filter.status = status;

    // Use parallel queries for better performance
    const [campaigns, total] = await Promise.all([
      Campaign.find(filter)
        .select('-__v')
        .populate('createdBy', 'name email profileImage')
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .lean(),
      Campaign.countDocuments(filter),
    ]);

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

// CREATE campaign (admin only)
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

    if (!user || user.role !== 'admin') {
      return Response.json(
        { success: false, message: 'Only admins can create campaigns' },
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

    const campaign = await Campaign.create({
      title,
      description,
      payoutPer1000Views,
      rules,
      maxClippers,
      startDate,
      endDate,
      banner,
      createdBy: userId,
      status: 'active',
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
    return Response.json(
      { success: false, message: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
