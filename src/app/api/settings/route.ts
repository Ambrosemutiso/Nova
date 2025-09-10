import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import {dbConnect} from '@/lib/dbConnect';
import User from '@/app/models/user';
import Seller from '@/app/models/seller';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret';

// ✅ Verify JWT
function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.split(' ')[1];
    return jwt.verify(token, JWT_SECRET) as { id: string; role: string };
  } catch {
    return null;
  }
}

// ✅ GET settings
export async function GET(req: NextRequest) {
  await dbConnect();
  const decoded = verifyToken(req);
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let account;
  if (decoded.role === 'seller') {
    account = await Seller.findById(decoded.id).select('settings');
  } else {
    account = await User.findById(decoded.id).select('settings');
  }

  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  return NextResponse.json({
    role: decoded.role,
    settings: account.settings,
  });
}

// ✅ PATCH settings
export async function PATCH(req: NextRequest) {
  await dbConnect();
  const decoded = verifyToken(req);
  if (!decoded) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { settings } = body;

  if (!settings) {
    return NextResponse.json({ error: 'Settings are required' }, { status: 400 });
  }

  let account;
  if (decoded.role === 'seller') {
    account = await Seller.findByIdAndUpdate(
      decoded.id,
      { $set: { settings } },
      { new: true, runValidators: true }
    ).select('settings');
  } else {
    account = await User.findByIdAndUpdate(
      decoded.id,
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
