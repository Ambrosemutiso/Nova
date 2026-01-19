// /app/api/wallet/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import WalletTransaction from '@/app/models/walletTransaction';

export async function GET(req: NextRequest) {
  await dbConnect();

  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ message: 'Missing userId' }, { status: 400 });
  }

  const txs = await WalletTransaction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50);

  return NextResponse.json(
    txs.map(tx => ({
      id: tx._id.toString(),
      type: tx.type,
      amount: tx.amount,
      label: tx.label,
      date: tx.createdAt,
    }))
  );
}
