// app/api/auth/google-login/route.ts
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/app/models/user';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { _id, name, email, image, role } = await req.json(); // ✅ include _id

    // Check if user already exists by email
    let user = await User.findOne({ email });

    // If not, create new user with _id
    if (!user) {
      user = await User.create({ _id, name, email, image, role });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('MongoDB save error:', error);
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}


