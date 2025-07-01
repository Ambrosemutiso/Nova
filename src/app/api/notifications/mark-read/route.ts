import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Notification from '@/app/models/notification';

export async function PUT(req: NextRequest) {
  await dbConnect();

  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }

    await Notification.updateMany({ recipient: userId, read: false }, { $set: { read: true } });

    return NextResponse.json({ success: true, message: 'Notifications marked as read' });
  } catch (err) {
    console.error('Mark as read error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
