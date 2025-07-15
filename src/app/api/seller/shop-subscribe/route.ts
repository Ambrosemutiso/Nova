import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Seller from '@/app/models/seller';

export async function POST(req: NextRequest) {
  await dbConnect();

  const { sellerId } = await req.json();

  if (!sellerId) {
    return NextResponse.json({ error: 'Missing sellerId' }, { status: 400 });
  }

  try {
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const now = new Date();
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1); // 1 year subscription

    seller.shop = {
      isActive: true,
      activatedAt: now,
      expiresAt: expiry,
      amountPaid: 1300,
      transactionId: 'TRX-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    };

    await seller.save();

    return NextResponse.json({
      success: true,
      shopExpiry: seller.shop.expiresAt,
    });
  } catch (error) {
    console.error('[Activate Shop Error]:', error);
    return NextResponse.json({ error: 'Failed to activate shop' }, { status: 500 });
  }
}
