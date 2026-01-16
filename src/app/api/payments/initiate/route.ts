// /app/api/payments/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import PaymentIntent from '@/app/models/paymentIntent';
import { initiateSTKPush } from '@/lib/mpesa';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const {
      phone,
      method,
      amount,
      userId,
      purpose,
      refId,   
      items,
      deliveryFee,
      county,
      town,
    } = await req.json();

    if (!phone || !amount || !userId || !purpose || !refId) {
      return NextResponse.json(
        { message: 'Missing required payment fields' },
        { status: 400 }
      );
    }

    // 1️⃣ Create payment intent
    const paymentIntent = await PaymentIntent.create({
      userId,
      amount,
      method,
      purpose,
      refId,
      status: 'pending',
      metadata: {
        items,
        deliveryFee,
        county,
        town,
      },
    });

    // 2️⃣ Trigger STK Push (MPesa only)
    if (method === 'mpesa') {
      const stk = await initiateSTKPush({
        phone,
        amount,
        accountReference: `PAY-${paymentIntent._id}`,
        description:
          purpose === 'order'
            ? 'Order Payment'
            : purpose === 'installment-deposit'
            ? 'Installment Deposit'
            : 'Installment Monthly Payment',
      });

      if (!stk.success) {
        paymentIntent.status = 'FAILED';
        await paymentIntent.save();

        return NextResponse.json(
          { message: 'Failed to initiate STK push' },
          { status: 500 }
        );
      }

      paymentIntent.providerCheckoutId = stk.CheckoutRequestID;
      await paymentIntent.save();
    }

    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent._id,
    });
  } catch (error) {
    console.error('[PAYMENT INITIATE ERROR]', error);
    return NextResponse.json(
      { message: 'Payment initiation failed' },
      { status: 500 }
    );
  }
}
