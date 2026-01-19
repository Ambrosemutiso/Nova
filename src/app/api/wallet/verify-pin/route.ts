// /app/api/wallet/verify-pin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/dbConnect';
import Wallet from '@/app/models/wallet';

export async function POST(req: NextRequest) {
  await dbConnect();

  const { userId, pin } = await req.json();

  const wallet = await Wallet.findOne({ userId });
  if (!wallet || !wallet.pinHash) {
    return NextResponse.json(
      { message: 'PIN not set' },
      { status: 400 }
    );
  }

  const valid = await bcrypt.compare(pin, wallet.pinHash);

  if (!valid) {
    return NextResponse.json(
      { message: 'Invalid PIN' },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true });
}
