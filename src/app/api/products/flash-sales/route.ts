import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Product from '@/app/models/product';

export async function GET() {
  try {
    await dbConnect();

    const products = await Product.find({ calculatedPrice: { $lt: 50000 } })
      .sort({ createdAt: -1 }) // optional: newest first
      .limit(50); // limit for flash sale

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching flash sale products:', error);
    return NextResponse.json({ error: 'Failed to load flash sale products' }, { status: 500 });
  }
}
