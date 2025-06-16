// app/api/seller/follow/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { SellerFollow } from '@/app/models/follow';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { sellerId, userId } = await req.json();

  if (!sellerId || !userId) {
    return NextResponse.json({ error: 'Missing sellerId or userId' }, { status: 400 });
  }

  const existing = await SellerFollow.findOne({ sellerId, followerId: userId });

  if (existing) {
    await SellerFollow.deleteOne({ _id: existing._id });
    return NextResponse.json({ message: 'Unfollowed seller', isFollowing: false });
  }

  await SellerFollow.create({ sellerId, followerId: userId });
  return NextResponse.json({ message: 'Followed seller', isFollowing: true });
}
