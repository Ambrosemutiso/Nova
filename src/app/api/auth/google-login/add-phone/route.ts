// app/api/auth/add-phone/route.ts
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

    // ✅ Prevent duplicate phone numbers
    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      return NextResponse.json(
        { error: 'Phone number already in use' },
        { status: 409 }
      );
    }

    // ✅ Update user with phone number
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { phoneNumber } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ✅ If role is seller, also update Seller collection
    if (role === 'seller') {
      await Seller.findOneAndUpdate(
        { email },
        { $set: { phoneNumber } },
        { new: true }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Error updating phone number:', error);
    return NextResponse.json(
      { error: 'Failed to update phone number' },
      { status: 500 }
    );
  }
}
