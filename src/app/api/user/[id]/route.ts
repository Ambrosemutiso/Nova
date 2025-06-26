import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/app/models/user';

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
    console.log('Received ID:', params.id);
  await dbConnect();

  const { id } = params;
  const user = await User.findById(id).select('name isVerified followers score');

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function POST(req: NextRequest, { params }: Params) {
  await dbConnect();

  const { id } = params;
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ message: 'User ID required' }, { status: 400 });
  }

  const seller = await User.findById(id);
  if (!seller || seller.role !== 'seller') {
    return NextResponse.json({ message: 'Seller not found' }, { status: 404 });
  }

  const isFollowing = seller.followers?.includes(userId);

  if (isFollowing) {
    seller.followers = seller.followers.filter((f: string) => f !== userId);
  } else {
    seller.followers.push(userId);
  }

  await seller.save();

  return NextResponse.json({
    message: isFollowing ? 'Unfollowed seller' : 'Followed seller',
    isFollowing: !isFollowing,
    followers: seller.followers.length,
  });
}
