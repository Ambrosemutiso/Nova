import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Seller from '@/app/models/seller';

export async function GET(req: NextRequest) {
  await dbConnect();

  const now = new Date();

  try {
    const activeSellers = await Seller.find({
      'shop.isActive': true,
      'shop.expiresAt': { $gt: now },
    }).select('_id name email image shopName shop.plan');

    return NextResponse.json({ sellers: activeSellers });
  } catch (error) {
    console.error('Failed to fetch active shops:', error);
    return NextResponse.json({ error: 'Failed to load shops' }, { status: 500 });
  }
}
