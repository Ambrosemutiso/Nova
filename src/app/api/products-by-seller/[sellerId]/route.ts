// /app/api/products-by-seller/[sellerId]/route.ts
import { dbConnect } from '@/lib/dbConnect';
import Product from '@/app/models/product';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { sellerId: string } }) {
  await dbConnect();
  const { sellerId } = params;

  try {
    const products = await Product.find({ sellerId }).limit(6);
    return NextResponse.json({ products });
    } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
