import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Seller from '@/app/models/seller';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ sellerId: string }> }
) {
  try {
    const { sellerId } = await context.params;

    await dbConnect();

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