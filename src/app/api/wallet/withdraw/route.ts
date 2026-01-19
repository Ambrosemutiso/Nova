// app/api/wallet/withdraw/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import Wallet from '@/app/models/wallet';
import WalletTransaction from '@/app/models/walletTransaction';

export async function POST(req: NextRequest) {
  try {
    const { userId, pin, amount, method } = await req.json();

    if (!userId || !pin || !amount || !method) {
      return NextResponse.json(
        { message: 'Missing fields' },
        { status: 400 }
      );
    }

    const wallet = await Wallet.findOne({ userId });

    if (!wallet || !wallet.pinHash) {
      return NextResponse.json(
        { message: 'Wallet not ready' },
        { status: 400 }
      );
    }

    const validPin = await bcrypt.compare(pin, wallet.pinHash);
    if (!validPin) {
      return NextResponse.json(
        { message: 'Invalid PIN' },
        { status: 401 }
      );
    }

    if (wallet.balance < amount) {
      return NextResponse.json(
        { message: 'Insufficient balance' },
        { status: 400 }
      );
    }

    const balanceBefore = wallet.balance;
    wallet.balance -= amount;
    await wallet.save();

    // 🔁 Log transaction
    await WalletTransaction.create({
      walletId: wallet._id,
      type: 'debit',
      amount,
      purpose: 'withdrawal',
      method, // mpesa | airtel | card
      balanceBefore,
      balanceAfter: wallet.balance,
      status: 'pending', // B2C async
    });

    // 🔜 NEXT STEP (coming next)
    // initiateMpesaB2C({ userId, amount });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[WITHDRAW ERROR]', error);
    return NextResponse.json(
      { message: 'Withdrawal failed' },
      { status: 500 }
    );
  }
}
