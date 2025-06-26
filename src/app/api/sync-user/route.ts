// app/api/sync-user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/app/models/user';

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  const { uid, email, name, photo, role } = body;

  if (!uid || !email || !role) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  const existing = await User.findById(uid);
  if (!existing) {
    await User.create({
      _id: uid,
      email,
      name,
      photo,
      role,
    });
  }

  return NextResponse.json({ message: 'User synced to MongoDB' });
}
