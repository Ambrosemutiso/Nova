//app/api/wallet/set-pin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import Wallet from '@/app/models/wallet';

export async function POST(req: NextRequest) {
  const { userId, pin } = await req.json();

  if (!pin || pin.length !== 4)
    return NextResponse.json({ message: 'Invalid PIN' }, { status: 400 });

  const hash = await bcrypt.hash(pin, 10);

  const wallet =
    (await Wallet.findOne({ userId })) ||
    (await Wallet.create({ userId }));

  wallet.pinHash = hash;
  await wallet.save();

  return NextResponse.json({ success: true });
}
