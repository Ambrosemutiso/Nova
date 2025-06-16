import { NextResponse } from 'next/server';
import {dbConnect} from '@/lib/dbConnect';
import Notification from '@/app/models/notification';

export async function GET() {
  await dbConnect();

  try {
    const notifications = await Notification.find({ userType: 'buyer' }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch notifications' }, { status: 500 });
  }
}
