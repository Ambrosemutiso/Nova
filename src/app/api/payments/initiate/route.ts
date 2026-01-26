
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import PaymentIntent from '@/app/models/paymentIntent';
import Order from '@/app/models/orders';
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
      items,
      deliveryFee,
      county,
      town,
    } = await req.json();

    /* ===============================
       🔍 VALIDATION
    ================================ */
    if (!phone || !amount || !userId || !purpose) {
      return NextResponse.json(
        { message: 'Missing required payment fields' },
        { status: 400 }
      );
    }

    let orderId: string | null = null;

    /* ===============================
       🧾 CREATE ORDER (ORDER PAYMENTS)
    ================================ */
    if (purpose === 'order') {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
          { message: 'Order items are required' },
          { status: 400 }
        );
      }

      const order = await Order.create({
        userId,
        items,
        deliveryFee,
        totalAmount: amount,
        customerInfo: { county, town },
        status: 'pending',
      });

      orderId = order._id.toString();
    }

    /* ===============================
       💳 CREATE PAYMENT INTENT
    ================================ */
    const paymentIntent = await PaymentIntent.create({
      userId,
      amount,
      method,
      purpose,
      refId: purpose === 'order' ? orderId : userId, // 🔑 CRITICAL
      status: 'pending',
    });

    /* ===============================
       📲 INITIATE STK PUSH
    ================================ */
    if (method === 'mpesa') {
      const stk = await initiateSTKPush({
        phone,
        amount,
        accountReference: `PAY-${paymentIntent._id}`,
        description: purpose === 'order'
          ? 'Order payment'
          : 'Wallet',
      });

      if (!stk?.CheckoutRequestID) {
        paymentIntent.status = 'failed';
        await paymentIntent.save();

        // ❌ Cancel order if STK failed
        if (orderId) {
          await Order.findByIdAndUpdate(orderId, {
            status: 'failed',
          });
        }

        return NextResponse.json(
          { message: 'Failed to initiate STK push' },
          { status: 500 }
        );
      }

      paymentIntent.checkoutRequestId = stk.CheckoutRequestID;
      await paymentIntent.save();
    }

    /* ===============================
       ✅ RESPONSE
    ================================ */
    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent._id,
      orderId,
    });
  } catch (error) {
    console.error('[PAYMENT INITIATE ERROR]', error);

    return NextResponse.json(
      { message: 'Payment initiation failed' },
      { status: 500 }
    );
  }
}
