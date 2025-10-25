import { NextResponse, NextRequest } from 'next/server';
import {dbConnect} from '@/lib/dbConnect';
import Product from '@/app/models/product';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();

    // Return empty array if query is missing or too short
    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    // Case-insensitive search using regex
    const products = await Product.find({
      name: { $regex: q, $options: 'i' }
    })
      .select('_id name price images')
      .limit(5);

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching product suggestions:', error);
    return NextResponse.json(
      { error: 'Server error fetching product suggestions' },
      { status: 500 }
    );
  }
}
