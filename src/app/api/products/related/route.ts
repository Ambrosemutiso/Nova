// app/api/products/related/route.ts
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Product from '@/app/models/product';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword') || '';
  const excludeId = searchParams.get('excludeId');

  if (!keyword) {
    return NextResponse.json({ products: [] });
  }

  await dbConnect();

  const regex = new RegExp(keyword, 'i'); 
  const products = await Product.find({
    name: { $regex: regex },
    _id: { $ne: excludeId }, 
  })
    .limit(10)
    .lean();

  return NextResponse.json({ products });
}
