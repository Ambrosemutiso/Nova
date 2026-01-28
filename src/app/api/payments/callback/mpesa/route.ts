// /app/api/payments/callback/mpesa/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import PaymentIntent from '@/app/models/paymentIntent';
import Order from '@/app/models/orders';
import Installment from '@/app/models/InstallmentOrder';
import Wallet from '@/app/models/wallet';
import WalletTransaction from '@/app/models/walletTransaction';
import { notifyClient } from '@/lib/paymentStream';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    console.log('🔥 MPESA CALLBACK RECEIVED');

    const body = await req.json();
    const stkCallback = body?.Body?.stkCallback;

    // ✅ 1. Structure validation
    if (
      !stkCallback ||
      !stkCallback.CheckoutRequestID ||
      typeof stkCallback.ResultCode !== 'number'
    ) {
      console.error('Invalid callback payload', body);
      return NextResponse.json({ message: 'Invalid callback' }, { status: 400 });
    }

    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;

    // ✅ 2. Find intent
    const paymentIntent = await PaymentIntent.findOne({
      checkoutRequestId,
    });

    if (!paymentIntent) {
      console.error('PaymentIntent not found:', checkoutRequestId);
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
    }

    // ✅ 3. Idempotency
    if (paymentIntent.status === 'paid') {
      return NextResponse.json({ success: true });
    }

    // ❌ Payment failed
    if (resultCode !== 0) {
      paymentIntent.status = 'failed';
      await paymentIntent.save();

      notifyClient(paymentIntent._id.toString(), {
        status: 'failed',
      });

      return NextResponse.json({ success: false });
    }

    // ✅ Payment success
    paymentIntent.status = 'paid';
    await paymentIntent.save();

    // ✅ 4. Business logic
    switch (paymentIntent.purpose) {
      case 'order':
        await Order.findByIdAndUpdate(paymentIntent.refId, {
          status: 'paid',
          paidAt: new Date(),
        });
        break;

      case 'installment-deposit':
        await Installment.findByIdAndUpdate(paymentIntent.refId, {
          depositPaid: true,
          status: 'active',
        });
        break;

      case 'installment-monthly': {
        const inst = await Installment.findById(paymentIntent.refId);
        if (inst) {
          inst.paidMonths += 1;
          inst.paidAmount += paymentIntent.amount;
          if (inst.paidMonths >= inst.months) {
            inst.status = 'completed';
          }
          await inst.save();
        }
        break;
      }

      case 'wallet': {
const walletId = paymentIntent.refId;

const wallet = await Wallet.findById(walletId);
if (!wallet) throw new Error('Wallet not found');

wallet.balance += paymentIntent.amount;
await wallet.save();


await WalletTransaction.create({
  walletId: wallet._id,      // ✅ wallet reference
  userId: wallet.userId,     // ✅ user reference
  type: 'credit',
  purpose: 'wallet',
  status: 'paid',
  amount: paymentIntent.amount,
  label: 'Wallet top-up',
  reference: checkoutRequestId,
  balanceAfter: wallet.balance,
});

        break;
      }       
      
      case 'order': {
        await Order.findByIdAndUpdate(
          paymentIntent.refId,
          {
            status: 'paid',
            paymentInfo: {
              method: 'mpesa',
              receipt: checkoutRequestId,
              paidAt: new Date(),
            },
          },
        );
        break;
      }
    }


    // ✅ 5. Notify frontend instantly
    notifyClient(paymentIntent._id.toString(), {
      status: 'paid',
      amount: paymentIntent.amount,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[MPESA CALLBACK ERROR]', err);
    return NextResponse.json(
      { message: 'Callback processing failed' },
      { status: 500 }
    );
  }
}
