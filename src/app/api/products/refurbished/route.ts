import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Product from '@/app/models/product';

export async function GET() {
  try {
    await dbConnect();

    const products = await Product.find({
      condition: { $in: ['used', 'refurbished'] },
    })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching used/refurbished products:', error);
    return NextResponse.json(
      { message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
