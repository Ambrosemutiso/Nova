// app/api/wallet/pin-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Wallet from '@/app/models/wallet';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ hasPin: false }, { status: 400 });
  }

  const wallet = await Wallet.findOne({ userId });

  return NextResponse.json({
    hasPin: Boolean(wallet?.pinHash),
  });
}
