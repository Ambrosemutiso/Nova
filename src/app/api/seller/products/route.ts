import { NextResponse } from 'next/server';
import Product from '@/app/models/product';
import { dbConnect } from '@/lib/dbConnect';

export async function GET(req: Request) {
  await dbConnect();

  const url = new URL(req.url);
  const sellerId = url.searchParams.get('sellerId');

  if (!sellerId) {
    return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 });
  }

  try {
    const products = await Product.find({ sellerId }).sort({ createdAt: -1 });
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
