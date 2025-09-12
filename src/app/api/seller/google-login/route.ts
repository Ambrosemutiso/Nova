import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Seller from '@/app/models/seller';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { name, email, image, role, phoneNumber, country, currency } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    let seller = await Seller.findOne({ email });

    if (!seller) {
      seller = await Seller.create({
        name,
        email,
        image,
        role: role || 'seller',
        phoneNumber,
        country,
        currency,
      });
    }

    return NextResponse.json({ success: true, user: seller });
  } catch (err) {
    console.error('Error logging in seller:', err);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
