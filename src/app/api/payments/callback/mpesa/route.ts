import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import PaymentIntent from '@/app/models/paymentIntent';
import Wallet from '@/app/models/wallet';
import Order from '@/app/models/orders';
import Installment from '@/app/models/InstallmentOrder';
import WalletTransaction from '@/app/models/walletTransaction';
import { notifyClient } from '@/lib/paymentStream';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const stk = body?.Body?.stkCallback;

    if (!stk?.CheckoutRequestID) {
      return NextResponse.json({ message: 'Invalid callback' }, { status: 400 });
    }

    const intent = await PaymentIntent.findOne({
      checkoutRequestId: stk.CheckoutRequestID,
    });

    if (!intent) return NextResponse.json({ success: true });

    // 🛑 Idempotency guard
if (intent.processed) {
  return NextResponse.json({ success: true });
}

// process EVERYTHING first

intent.status = 'paid';
intent.processed = true;
await intent.save();

    // ❌ FAILED PAYMENT
    if (stk.ResultCode !== 0) {
      intent.status = 'failed';
      await intent.save();

      notifyClient(intent._id.toString(), { status: 'failed' });
      return NextResponse.json({ success: false });
    }

    /* ===============================
       💰 WALLET TOP-UP
    ================================ */
if (intent.purpose === 'wallet') { 
  const wallet = await Wallet.findById(intent.refId); 
  if (!wallet) throw new Error('Wallet not found'); 
  const balanceBefore = wallet.balance; 
  wallet.balance += intent.amount; 
  await wallet.save(); 
  
  await WalletTransaction.create({ 
    walletId: wallet._id, 
    type: 'credit', 
    amount: intent.amount, 
    purpose: 'wallet', 
    refId: intent._id.toString(), 
    balanceBefore, 
    balanceAfter: wallet.balance, 
  });
 }

    /* ===============================
       🧾 ORDER PAYMENT
    ================================ */
    if (intent.purpose === 'order') {
      await Order.findByIdAndUpdate(intent.refId, {
        status: 'paid',
        paymentInfo: {
          method: 'mpesa',
          checkoutRequestId: stk.CheckoutRequestID,
          paidAt: new Date(),
        },
      });
    }

    /* ===============================
       📆 INSTALLMENT MONTHLY PAYMENT
    ================================ */
if (intent.purpose === 'installment-monthly') {
  const installment = await Installment.findById(intent.refId);
  if (!installment) throw new Error('Installment not found');

  const update: any = {
    $inc: { paidAmount: intent.amount },
  };

  if (!installment.depositPaid) {
    update.$set = {
      depositPaid: true,
      status: 'active',
    };
  }

  if (installment.paidAmount + intent.amount >= installment.totalAmount) {
    update.$set = {
      ...(update.$set || {}),
      status: 'completed',
    };
  }

  await Installment.findByIdAndUpdate(intent.refId, update);
}

    // 🔔 Notify frontend
    notifyClient(intent._id.toString(), {
      status: 'paid',
      amount: intent.amount,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('MPESA CALLBACK ERROR', err);
    return NextResponse.json(
      { message: 'Callback failed' },
      { status: 500 }
    );
  }
}

















