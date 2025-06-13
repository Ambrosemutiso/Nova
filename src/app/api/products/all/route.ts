import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Product from '@/app/models/product';

export async function GET() {
  try {
    // Connect to the database
    await dbConnect();

    // Fetch all products from the database
    const products = await Product.find();

    // Return the products as JSON
    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}
