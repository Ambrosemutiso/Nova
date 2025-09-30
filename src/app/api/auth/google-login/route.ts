// app/api/auth/google-login/route.ts
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/app/models/user';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { _id, name, email, image, role, phoneNumber, country, currency } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    let user = await User.findOne({ email });

    if (!user) {
      const newUserData: any = {
        _id,
        name,
        email,
        image,
        role,
        country: country || null,
        currency: currency || null,
      };

      // ✅ Only set phoneNumber if provided
      if (phoneNumber) {
        newUserData.phoneNumber = phoneNumber;
      }

      user = await User.create(newUserData);
    }

    // If phoneNumber is missing, tell frontend to show phone modal
    if (!user.phoneNumber) {
      return NextResponse.json({
        success: true,
        user,
        needsPhoneNumber: true,
      });
    }

    return NextResponse.json({ success: true, user, needsPhoneNumber: false });
  } catch (error) {
    console.error('MongoDB save error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
