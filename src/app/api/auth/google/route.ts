// app/api/auth/google-login/route.ts
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/app/models/user';

export async function POST(req: Request) {
  try {
    const { name, email, photo, role } = await req.json();

    await dbConnect();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        photo,
        role,
      });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error in google-login route:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
