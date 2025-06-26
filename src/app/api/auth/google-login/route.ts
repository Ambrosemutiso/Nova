import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/app/models/user';
import Seller from '@/app/models/seller';

const MONGODB_URI = process.env.MONGODB_URI!;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, image, role } = body;

  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(MONGODB_URI);
    }

    let user;

    if (role === 'buyer') {
      user = await User.findOne({ email });
      if (!user) user = await User.create({ name, email, image, role });
    } else if (role === 'seller') {
      user = await Seller.findOne({ email });
      if (!user) user = await Seller.create({ name, email, image, role });
    } else {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
