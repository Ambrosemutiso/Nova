import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import PaymentIntent from '@/app/models/paymentIntent';
import { initiateSTKPush } from '@/lib/mpesa';

export async function POST(req: Request) {
  try {
    await dbConnect();

    const {
      userId,
      phone,
      amount,
      method,      // 'mpesa' | 'airtel' | 'npay'
      purpose,     // 'order' | 'installment-deposit' | 'installment-monthly' | 'wallet'
      refId,       // orderId | installmentId | walletId | etc
    } = await req.json();

    // 🔐 Validation
    if (!userId || !amount || !method || !purpose || !refId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (method !== 'npay' && !phone) {
      return NextResponse.json(
        { error: 'Phone number required for mobile payments' },
        { status: 400 }
      );
    }

    const safeAmount = Math.round(Number(amount));
    if (safeAmount < 1) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      );
    }

    // 🧾 Create Payment Intent (single source of truth)
    const intent = await PaymentIntent.create({
      userId,
      amount: safeAmount,
      method,
      purpose,
      refId,
      status: 'pending',
    });

    // 🟣 N-PAY (internal wallet / instant success)
    if (method === 'npay') {
      intent.status = 'paid';
      await intent.save();

      return NextResponse.json({
        success: true,
        intentId: intent._id,
        status: 'paid',
      });
    }

    // 📲 M-PESA / AIRTEL STK PUSH
    const stk = await initiateSTKPush({
      phone,
      amount: safeAmount,
      accountReference: intent._id.toString(), // 🔥 universal reference
      description:
        purpose === 'order'
          ? 'Order Payment'
          : purpose === 'installment-deposit'
          ? 'Installment Deposit'
          : purpose === 'installment-monthly'
          ? 'Installment Payment'
          : 'Wallet Top-up',
    });

    if (!stk.success) {
      intent.status = 'failed';
      await intent.save();

      return NextResponse.json(
        { error: 'STK push failed' },
        { status: 500 }
      );
    }

    // Save M-Pesa IDs for callback tracking
    intent.checkoutRequestId = stk.CheckoutRequestID;
    intent.merchantRequestId = stk.MerchantRequestID;
    await intent.save();

    return NextResponse.json({
      success: true,
      intentId: intent._id,
      checkoutRequestId: stk.CheckoutRequestID,
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
