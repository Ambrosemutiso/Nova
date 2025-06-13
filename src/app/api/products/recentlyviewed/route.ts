// app/api/products/recently-viewed/route.ts
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import ProductModel from '@/app/models/product';
import { Product } from '@/app/types/product'; 

export async function POST(req: Request) {
  const { ids } = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ products: [] });
  }

  await dbConnect();

  const products = await ProductModel.find({ _id: { $in: ids } }).lean() as unknown as Product[];

  // Return in same order as received
  const sorted = ids
    .map((id: string) => products.find(p => p._id.toString() === id))
    .filter(Boolean);

  return NextResponse.json({ products: sorted });
}
