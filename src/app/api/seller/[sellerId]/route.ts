// app/api/seller/[sellerId]/route.ts
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Seller from '@/app/models/seller';

export async function GET(
  req: Request,
  { params }: { params: { sellerId: string } }
) {
  await dbConnect();

  const { sellerId } = params;

  if (!sellerId) {
    return NextResponse.json({ success: false, message: 'Missing sellerId' }, { status: 400 });
  }

  try {
    const seller = await Seller.findById(sellerId).lean();

    if (!seller) {
      return NextResponse.json({ success: false, message: 'Seller not found' }, { status: 404 });
    }

    return NextResponse.json(seller);
  } catch (error) {
    console.error('Error fetching seller:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
