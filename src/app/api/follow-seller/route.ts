// app/api/follow-seller/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Seller from '@/app/models/seller';

import { Types } from 'mongoose'; // make sure this is imported

type Follower = {
  userId: Types.ObjectId;
  followedAt: Date;
};

export async function POST(req: NextRequest) {
  try {
    const { sellerId, userId, action } = await req.json();

    if (!sellerId || !userId || !action) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return NextResponse.json({ success: false, error: 'Seller not found' }, { status: 404 });
    }

    if (sellerId === userId) {
      return NextResponse.json({ success: false, error: 'You cannot follow yourself' }, { status: 400 });
    }

const alreadyFollowing = seller.followers.some((f: Follower) => f.userId.toString() === userId);

    if (action === 'follow') {
      if (!alreadyFollowing) {
        seller.followers.push({ userId, followedAt: new Date() });
        await seller.save();
        return NextResponse.json({ success: true, message: 'Followed seller' });
      } else {
        return NextResponse.json({ success: false, message: 'Already following this seller' });
      }
    }

    if (action === 'unfollow') {
      if (alreadyFollowing) {
seller.followers = seller.followers.filter((f: Follower) => f.userId.toString() !== userId);
        await seller.save();
        return NextResponse.json({ success: true, message: 'Unfollowed seller' });
      } else {
        return NextResponse.json({ success: false, message: 'You are not following this seller' });
      }
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Follow/Unfollow error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
