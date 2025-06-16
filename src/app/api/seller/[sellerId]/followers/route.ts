// app/api/seller/[sellerId]/followers/route.ts
import { dbConnect } from '@/lib/dbConnect';
import { SellerFollow } from '@/app/models/follow';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_: NextRequest, { params }: { params: { sellerId: string } }) {
  await dbConnect();

  const count = await SellerFollow.countDocuments({ sellerId: params.sellerId });
  return NextResponse.json({ followers: count });
}
