// /app/api/wallet/balance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Wallet from '@/app/models/wallet';

export async function GET(req: NextRequest) {
  await dbConnect();

  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ message: 'Missing userId' }, { status: 400 });
  }

  let wallet = await Wallet.findOne({ userId });

  if (!wallet) {
    wallet = await Wallet.create({ userId, balance: 0 });
  }

  return NextResponse.json({
    balance: wallet.balance,
  });
}
