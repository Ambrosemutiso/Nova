import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import PaymentIntent from '@/app/models/paymentIntent';
import Wallet from '@/app/models/wallet';
import WalletTransaction from '@/app/models/walletTransaction';
import { notifyClient } from '@/lib/paymentStream';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const stk = body?.Body?.stkCallback;

    if (!stk || !stk.CheckoutRequestID) {
      return NextResponse.json({ message: 'Invalid callback' }, { status: 400 });
    }

    const intent = await PaymentIntent.findOne({
      checkoutRequestId: stk.CheckoutRequestID,
    });

    if (!intent) return NextResponse.json({ success: true });

    if (intent.status === 'paid') {
      return NextResponse.json({ success: true });
    }

    if (stk.ResultCode !== 0) {
      intent.status = 'failed';
      await intent.save();

      notifyClient(intent._id.toString(), { status: 'failed' });
      return NextResponse.json({ success: false });
    }

    // ✅ Success
    intent.status = 'paid';
    await intent.save();

    // Wallet credit
    if (intent.purpose === 'wallet') {
      let wallet = await Wallet.findOne({ userId: intent.refId });
      if (!wallet) wallet = await Wallet.create({ userId: intent.refId, balance: 0 });

      wallet.balance += intent.amount;
      await wallet.save();

      await WalletTransaction.create({
        userId: intent.refId,
        type: 'credit',
        amount: intent.amount,
        label: 'Wallet top-up (M-Pesa)',
        reference: stk.CheckoutRequestID,
        balanceAfter: wallet.balance,
      });
    }

    // 🔥 Notify frontend
    notifyClient(intent._id.toString(), {
      status: 'paid',
      amount: intent.amount,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('MPESA CALLBACK ERROR', err);
    return NextResponse.json({ message: 'Callback failed' }, { status: 500 });
  }
}
