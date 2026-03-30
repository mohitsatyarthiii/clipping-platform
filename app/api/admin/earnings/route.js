import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwtService';

export async function GET(req) {
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
    const user = await User.findById(userId).lean();

    if (!user || user.role !== 'admin') {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get earnings from clippers and creators
    const clippers = await User.find({ role: { $in: ['clipper', 'creator'] } })
      .select('name email earnings')
      .lean();

    const earnings = clippers.map((clipper) => ({
      userId: clipper._id,
      userName: clipper.name,
      userEmail: clipper.email,
      total: clipper.earnings?.total || 0,
      pending: clipper.earnings?.pending || 0,
      paid: clipper.earnings?.paid || 0,
    }));

    const totalRevenue = earnings.reduce((sum, e) => sum + e.total, 0);
    const totalPending = earnings.reduce((sum, e) => sum + e.pending, 0);
    const totalPaid = earnings.reduce((sum, e) => sum + e.paid, 0);

    return Response.json(
      {
        success: true,
        earnings: earnings.sort((a, b) => b.total - a.total),
        summary: {
          totalRevenue,
          totalPending,
          totalPaid,
          totalUsers: clippers.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get earnings error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch earnings' },
      { status: 500 }
    );
  }
}
