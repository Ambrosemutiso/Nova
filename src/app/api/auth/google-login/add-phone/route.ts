import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/app/models/user';
import Seller from '@/app/models/seller';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { email, phoneNumber, role } = await req.json();

    if (!email || !phoneNumber) {
      return NextResponse.json(
        { error: 'Email and phone number are required' },
        { status: 400 }
      );
    }

    // update User collection
    const user = await User.findOneAndUpdate(
      { email },
      { phoneNumber },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // update Seller collection if role is seller
    if (role === 'seller') {
      await Seller.findOneAndUpdate(
        { email },
        { phoneNumber },
        { new: true }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error updating phone number:', error);
    return NextResponse.json(
      { error: 'Failed to update phone number' },
      { status: 500 }
    );
  }
}
