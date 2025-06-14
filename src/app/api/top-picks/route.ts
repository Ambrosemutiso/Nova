import { NextRequest, NextResponse } from 'next/server';
import Product from '@/app/models/product';
import { dbConnect } from '@/lib/dbConnect';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { ids } = await req.json();

  const products = await Product.find({ _id: { $in: ids } });
  return NextResponse.json(products);
}
