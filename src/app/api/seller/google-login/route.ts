import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Seller from '@/app/models/seller';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { name, email, image, role, phoneNumber, country, currency, plan } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    let seller = await Seller.findOne({ email });

    if (!seller) {
      // Create a new seller (phoneNumber optional, plan defaults to unknown)
      seller = await Seller.create({
        name,
        email,
        image,
        role: role || 'seller',
        phoneNumber: phoneNumber || null, // allow null if not provided
        country: country || null,
        currency: currency || null,
        plan: plan || 'free',
      });
    } else {
      // Ensure existing sellers always have a plan
      if (!seller.plan) {
        seller.plan = 'free';
      }

      // If phoneNumber was not saved before but now provided, update it
      if (!seller.phoneNumber && phoneNumber) {
        seller.phoneNumber = phoneNumber;
      }

      await seller.save();
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
