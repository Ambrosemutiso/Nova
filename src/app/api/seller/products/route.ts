import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Product from '@/app/models/product';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const sellerId = req.nextUrl.searchParams.get('sellerId');

    if (!sellerId) {
      return NextResponse.json(
        { success: false, message: 'Missing sellerId in query' },
        { status: 400 }
      );
    }

    const products = await Product.find({ sellerId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: products }); // ✅ Fix: renamed "products" to "data"
  } catch (error) {
    console.error('Fetch seller products error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error fetching products' },
      { status: 500 }
    );
  }
}
