import { NextRequest, NextResponse } from 'next/server';
import Product from '@/app/models/product';
import { dbConnect } from '@/lib/dbConnect';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { recent } = await req.json();

  const recentProducts = await Product.find({ _id: { $in: recent } });
  const categories = [...new Set(recentProducts.map((p) => p.category))];

  const suggestions = await Product.find({
    category: { $in: categories },
    _id: { $nin: recent },
  }).limit(8);

  return NextResponse.json(suggestions);
}
