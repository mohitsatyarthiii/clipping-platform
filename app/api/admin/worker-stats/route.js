import { getWorker } from '@/lib/workers/youtubeWorker';
import { verifyToken } from '@/lib/jwtService';
import User from '@/models/User';
import connectDB from '@/lib/db';

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
    const user = await User.findById(userId);

    if (!user || user.role !== 'admin') {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const worker = getWorker();
    const stats = worker.getStats();

    return Response.json(
      {
        success: true,
        worker: stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get worker stats error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch worker stats' },
      { status: 500 }
    );
  }
}

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
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { action } = await req.json();

    if (!action || !['start', 'stop', 'run'].includes(action)) {
      return Response.json(
        { success: false, message: 'Invalid action' },
        { status: 400 }
      );
    }

    const worker = getWorker();

    if (action === 'start') {
      await worker.start();
      return Response.json(
        {
          success: true,
          message: 'Worker started',
          stats: worker.getStats(),
        },
        { status: 200 }
      );
    } else if (action === 'stop') {
      await worker.stop();
      return Response.json(
        {
          success: true,
          message: 'Worker stopped',
          stats: worker.getStats(),
        },
        { status: 200 }
      );
    } else if (action === 'run') {
      await worker.run();
      return Response.json(
        {
          success: true,
          message: 'Worker executed manually',
          stats: worker.getStats(),
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Worker action error:', error);
    return Response.json(
      { success: false, message: 'Failed to execute worker action' },
      { status: 500 }
    );
  }
}
