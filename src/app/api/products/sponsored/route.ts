// app/api/products/sponsored/route.ts
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Product from '@/app/models/product';
import Seller from '@/app/models/seller';

export async function GET() {
  try {
    await dbConnect();

    // Fetch sellers with 1000+ followers
    const verifiedSellers = await Seller.find({
      followers: { $exists: true },
      $expr: { $gte: [{ $size: '$followers' }, 1] },
    }).select('_id').sort({ createdAt: -1 }).limit(15);

    const sellerIds = verifiedSellers.map((s) => s._id);

    const products = await Product.find({ sellerId: { $in: sellerIds } });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching sponsored products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sponsored products' },
      { status: 500 }
    );
  }
}
