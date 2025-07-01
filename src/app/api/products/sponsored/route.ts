import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Product from '@/app/models/product';
import Seller from '@/app/models/seller';

export async function GET() {
  await dbConnect();

  // Find sellers with 1000+ followers
  const verifiedSellers = await Seller.find({ 'followers.1': { $exists: true } }).select('_id');

  const verifiedSellerIds = verifiedSellers.map((s) => s._id);

  const products = await Product.find({ sellerId: { $in: verifiedSellerIds } }).limit(10);

  return NextResponse.json({ products });
}
