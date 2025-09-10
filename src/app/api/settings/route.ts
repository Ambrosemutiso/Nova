import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/app/models/user';
import Seller from '@/app/models/seller';

// ✅ GET settings
export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const role = searchParams.get('role'); // 'user' or 'seller'

  if (!userId || !role) {
    return NextResponse.json({ error: 'userId and role are required' }, { status: 400 });
  }

  let account;
  if (role === 'seller') {
    account = await Seller.findById(userId).select('settings');
  } else {
    account = await User.findById(userId).select('settings');
  }

  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  return NextResponse.json({
    role,
    settings: account.settings,
  });
}

// ✅ PATCH settings
export async function PATCH(req: NextRequest) {
  await dbConnect();

  const body = await req.json();
  const { userId, role, settings } = body;

  if (!userId || !role || !settings) {
    return NextResponse.json({ error: 'userId, role and settings are required' }, { status: 400 });
  }

  let account;
  if (role === 'seller') {
    account = await Seller.findByIdAndUpdate(
      userId,
      { $set: { settings } },
      { new: true, runValidators: true }
    ).select('settings');
  } else {
    account = await User.findByIdAndUpdate(
      userId,
      { $set: { settings } },
      { new: true, runValidators: true }
    ).select('settings');
  }

  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  return NextResponse.json({
    message: 'Settings updated successfully',
    settings: account.settings,
  });
}
