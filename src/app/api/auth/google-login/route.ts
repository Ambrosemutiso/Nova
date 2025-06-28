// app/api/auth/google-login/route.ts
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/app/models/user';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { name, email, image, role } = await req.json();

    // Check if user already exists
    let user = await User.findOne({ email });

    // If not, create new user
    if (!user) {
      user = await User.create({ name, email, image, role });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('MongoDB save error:', error);
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}

