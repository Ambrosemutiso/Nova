// app/api/products/also-viewed/route.ts
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';
import Product from '@/app/models/product';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const excludeId = searchParams.get('excludeId');

  await dbConnect();

  const matchFilter = excludeId
    ? { _id: { $ne: new mongoose.Types.ObjectId(excludeId) } }
    : {};

  const products = await Product.aggregate([
    { $match: matchFilter },
    { $sample: { size: 10 } },
  ]);

  return NextResponse.json({ products });
}
