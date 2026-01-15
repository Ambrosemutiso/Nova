import { NextRequest } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/app/models/user';
import WalletTransaction from '@/app/models/walletTransaction';
import { WALLET_LIMITS } from '@/lib/walletConfig';

export async function POST(req: NextRequest) {
  await dbConnect();

  const { userId, amount, phone } = await req.json();
  const value = Math.round(Number(amount));

  // 🔒 Validation
  if (!value || value < WALLET_LIMITS.MIN_WITHDRAW) {
    return Response.json(
      { message: `Minimum withdrawal is ${WALLET_LIMITS.MIN_WITHDRAW} NC` },
      { status: 400 }
    );
  }

  if (!phone) {
    return Response.json(
      { message: 'Phone number required' },
      { status: 400 }
    );
  }

  const totalDebit = value + WALLET_LIMITS.WITHDRAW_FEE;

  const user = await User.findById(userId);
  if (!user || user.novaCoins < totalDebit) {
    return Response.json(
      { message: 'Insufficient balance' },
      { status: 400 }
    );
  }

  // 🔻 Deduct immediately (ledger-first approach)
  user.novaCoins -= totalDebit;
  await user.save();

  // 🧾 Ledger entries
  await WalletTransaction.create([
    {
      userId,
      type: 'debit',
      amount: value,
      method: 'WITHDRAW',
      description: 'Withdrawal to M-Pesa',
      status: 'PENDING',
    },
    {
      userId,
      type: 'debit',
      amount: WALLET_LIMITS.WITHDRAW_FEE,
      method: 'FEE',
      description: 'Withdrawal fee',
      status: 'COMPLETED',
    },
  ]);

  // 🚀 TODO: Trigger M-Pesa B2C payout here
  // await initiateMpesaB2C({ phone, amount: value })

  return Response.json({
    success: true,
    debited: totalDebit,
  });
}
