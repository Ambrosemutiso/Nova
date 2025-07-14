import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Message from '@/app/models/message';

export async function GET(req: NextRequest) {
  const user1 = req.nextUrl.searchParams.get('user1');
  const user2 = req.nextUrl.searchParams.get('user2');

  if (!user1 || !user2) {
    return NextResponse.json({ error: 'user1 and user2 required' }, { status: 400 });
  }

  await dbConnect();

  const msgs = await Message.find({
    $or: [
      { senderId: user1, receiverId: user2 },
      { senderId: user2, receiverId: user1 },
    ],
  }).sort('timestamp');

  return NextResponse.json({ messages: msgs });
}
