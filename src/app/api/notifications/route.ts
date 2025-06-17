import { NextRequest, NextResponse } from 'next/server';
import Notification from '@/app/models/notification';
import { dbConnect } from '@/lib/dbConnect';

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const userType = req.nextUrl.searchParams.get('role') || 'buyer';

    const notifications = await Notification.find({
      target: { $in: ['all', userType] }
    }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
