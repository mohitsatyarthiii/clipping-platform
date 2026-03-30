// app/api/worker/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Dynamic import ensures this only runs on server
    const { getWorker } = await import('@/lib/server');
    const worker = getWorker();
    await worker.run();
    
    return NextResponse.json({ 
      success: true, 
      stats: worker.getStats() 
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}