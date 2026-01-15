import { NextRequest } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import WalletTransaction from '@/app/models/walletTransaction';
import { WALLET_LIMITS } from '@/lib/walletConfig';
import { initiateSTKPush } from '@/lib/mpesa';

export async function POST(req: NextRequest) {
  await dbConnect();

  const { userId, amount, phone } = await req.json();
  const value = Math.round(Number(amount));

  if (!value || value < WALLET_LIMITS.MIN_DEPOSIT) {
    return Response.json(
      { message: `Minimum deposit is ${WALLET_LIMITS.MIN_DEPOSIT} KES` },
      { status: 400 }
    );
  }

  if (!phone) {
    return Response.json(
      { message: 'Phone number required' },
      { status: 400 }
    );
  }

  // 🧾 Create pending wallet transaction
  const tx = await WalletTransaction.create({
    userId,
    type: 'credit',
    amount: value,
    method: 'MPESA',
    description: 'Wallet top-up via M-Pesa',
    status: 'PENDING',
  });

  // 🚀 Trigger STK Push (GLOBAL reference)
  await initiateSTKPush({
    phone,
    amount: value,
    accountReference: `WALLET-${tx._id}`,
    description: 'Wallet Top-Up',
  });

  return Response.json({
    success: true,
    transactionId: tx._id,
  });
}
