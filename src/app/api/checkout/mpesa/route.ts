import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import Order from '@/app/models/orders';
import { dbConnect } from '@/lib/dbConnect';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const {
      phone,
      totalAmount,
      customerInfo,
      items,
      deliveryFee,
      userId,
    } = await req.json();

    // ✅ Sanity check
    if (!phone || !totalAmount || isNaN(totalAmount)) {
      return NextResponse.json({ message: 'Invalid phone number or amount' }, { status: 400 });
    }

    // ✅ Log key values
console.log('Initiating STK Push with:', { phone, totalAmount, roundedAmount: Math.round(totalAmount) });


    // 1. Save Order
    const newOrder = await Order.create({
      userId,
      customerInfo,
      items,
      deliveryFee,
      totalAmount,
      status: 'Processing',
    });

    // 2. Generate Timestamp and Password
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const businessShortCode = '174379';
    const passkey = process.env.MPESA_PASSKEY!;
    const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64');

    // 3. Get Access Token
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const { data: tokenRes } = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    const accessToken = tokenRes.access_token;

    // 4. Initiate STK Push
    const stkResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(totalAmount),
        PartyA: phone,
        PartyB: businessShortCode,
        PhoneNumber: phone,
        CallBackURL: 'https://yourdomain.com/api/checkout/callback',
        AccountReference: `Order-${newOrder._id}`,
        TransactionDesc: 'Order payment',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // 5. Store CheckoutRequestID
    const checkoutRequestId = stkResponse.data.CheckoutRequestID;
    newOrder.checkoutRequestId = checkoutRequestId;
    await newOrder.save();

    return NextResponse.json({ orderId: newOrder._id });
  } catch (err) {
    console.error('MPESA Payment error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ message: 'Payment initiation failed' }, { status: 500 });
  }
}
