// app/api/wallet/withdraw/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import Wallet from '@/app/models/wallet';
import WalletTransaction from '@/app/models/walletTransaction';
import { sendB2CPayment } from '@/lib/mpesab2c';

export async function POST(req: NextRequest) {
  try {
    const { userId, pin, amount, method, phoneNumber } = await req.json();

    if (!userId || !pin || !amount || !method) {
      return NextResponse.json(
        { message: 'Missing fields' },
        { status: 400 }
      );
    }

    const wallet = await Wallet.findOne({ userId });

    if (amount < 50) {
  return NextResponse.json(
    { message: 'Minimum withdrawal is 50' },
    { status: 400 }
  );
}

if (amount > 70000) {
  return NextResponse.json(
    { message: 'Maximum withdrawal exceeded' },
    { status: 400 }
  );
}

if (!wallet) {
  return NextResponse.json(
    { message: 'Wallet not found' },
    { status: 404 }
  );
}

if (!wallet.pinHash) {
  return NextResponse.json(
    { message: 'Please set wallet PIN first' },
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
      userId: wallet.userId, 
      walletId: wallet._id,
      type: 'debit',
      amount,
      purpose: 'withdrawal',
      label: 'Withdraw',
      method, // mpesa | airtel | card
      balanceBefore,
      balanceAfter: wallet.balance,
      status: 'pending', // B2C async
    });

// Send MPESA B2C
const b2cResponse = await sendB2CPayment({
  amount,
  phone: phoneNumber, // user phone
  remarks: 'N-PAY Wallet Withdrawal',
  transactionId: wallet._id.toString(),
});

console.log('B2C RESPONSE:', b2cResponse);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[WITHDRAW ERROR]', error);
    return NextResponse.json(
      { message: 'Withdrawal failed' },
      { status: 500 }
    );
  }
}
