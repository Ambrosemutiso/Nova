// /app/api/payments/callback/mpesa/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import PaymentIntent from '@/app/models/paymentIntent';
import Order from '@/app/models/orders';
import Installment from '@/app/models/InstallmentOrder';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const stkCallback = body.Body?.stkCallback;

    if (!stkCallback) {
      return NextResponse.json({ message: 'Invalid callback' }, { status: 400 });
    }

    const checkoutId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;

    const paymentIntent = await PaymentIntent.findOne({
      providerCheckoutId: checkoutId,
    });

    if (!paymentIntent) {
      console.error('PaymentIntent not found for checkout ID:', checkoutId);
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
    }

    // ❌ Payment failed
    if (resultCode !== 0) {
      paymentIntent.status = 'FAILED';
      await paymentIntent.save();

      return NextResponse.json({ success: false });
    }

    // ✅ Payment successful
    paymentIntent.status = 'SUCCESS';
    await paymentIntent.save();

    // 🔁 Resolve business logic
    switch (paymentIntent.purpose) {
      case 'order': {
        await Order.findByIdAndUpdate(paymentIntent.refId, {
          status: 'Paid',
          paidAt: new Date(),
        });
        break;
      }

      case 'installment-deposit': {
        await Installment.findByIdAndUpdate(paymentIntent.refId, {
          depositPaid: true,
          status: 'active',
          depositPaidAt: new Date(),
        });
        break;
      }

      case 'installment-monthly': {
        const installment = await Installment.findById(
          paymentIntent.refId
        );

        if (installment) {
          installment.paidMonths += 1;
          installment.paidAmount += paymentIntent.amount;

          if (installment.paidMonths >= installment.months) {
            installment.status = 'completed';
          }

          await installment.save();
        }
        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[MPESA CALLBACK ERROR]', error);
    return NextResponse.json(
      { message: 'Callback processing failed' },
      { status: 500 }
    );
  }
}
