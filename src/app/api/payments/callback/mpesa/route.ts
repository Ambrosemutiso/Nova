import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import PaymentIntent from '@/app/models/paymentIntent';
import Wallet from '@/app/models/wallet';
import Order from '@/app/models/orders';
import Installment from '@/app/models/InstallmentOrder';
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
    if (intent.status === 'paid' || intent.status === 'failed') {
      return NextResponse.json({ success: true });
    }

    // ❌ FAILED PAYMENT
    if (stk.ResultCode !== 0) {
      intent.status = 'failed';
      await intent.save();

      notifyClient(intent._id.toString(), { status: 'failed' });
      return NextResponse.json({ success: false });
    }

    // ✅ SUCCESS
    intent.status = 'paid';
    await intent.save();

    /* ===============================
       💰 WALLET TOP-UP
    ================================ */
if (intent.purpose === 'wallet') {
  const wallet = await Wallet.findById(intent.refId);
  if (!wallet) throw new Error('Wallet not found');

  const balanceBefore = wallet.balance;
  wallet.balance += intent.amount;
  await wallet.save();
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

      installment.paidAmount += intent.amount;

      // ✅ Deposit auto-flag (if first payment)
      if (!installment.depositPaid) {
        installment.depositPaid = true;
        installment.status = 'active';
      }

      // ✅ Fully paid
      if (installment.paidAmount >= installment.totalAmount) {
        installment.status = 'completed';
      }

      await installment.save();
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
