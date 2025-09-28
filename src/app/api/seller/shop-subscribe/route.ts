import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Seller from '@/app/models/seller';

const DARAJA_CONSUMER_KEY = process.env.DARAJA_CONSUMER_KEY!;
const DARAJA_CONSUMER_SECRET = process.env.DARAJA_CONSUMER_SECRET!;
const DARAJA_PASSKEY = process.env.DARAJA_PASSKEY!;
const SHORTCODE = process.env.DARAJA_SHORTCODE!;
const CALLBACK_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/api/seller/payment-callback`;

async function getAccessToken() {
  const res = await fetch(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(`${DARAJA_CONSUMER_KEY}:${DARAJA_CONSUMER_SECRET}`).toString('base64'),
      },
    }
  );
  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const { sellerId, phoneNumber, amount } = await req.json();

  if (!sellerId || !phoneNumber || !amount) {
    return NextResponse.json({ error: 'Missing sellerId, phoneNumber, or amount' }, { status: 400 });
  }

  // validate requested package
  if (![1300, 3000].includes(amount)) {
    return NextResponse.json({ error: 'Invalid package amount' }, { status: 400 });
  }

  try {
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    let chargeAmount = amount;

    // === TOP-UP LOGIC ===
    if (seller.subscriptionTier === 'Premium') {
      // Already Premium → no need to pay again
      return NextResponse.json({ error: 'You are already on Premium' }, { status: 400 });
    }

    if (seller.subscriptionTier === 'Basic' && amount === 3000) {
      // Upgrade from Basic to Premium → pay only the difference
      chargeAmount = 3000 - 1300; // 1700
    }

    const token = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

    const password = Buffer.from(`${SHORTCODE}${DARAJA_PASSKEY}${timestamp}`).toString('base64');

    const stkRes = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: chargeAmount,
        PartyA: phoneNumber,
        PartyB: SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: CALLBACK_URL,
        AccountReference: seller._id.toString(),
        TransactionDesc:
          amount === 1300
            ? 'Seller Shop Subscription - Basic'
            : 'Seller Shop Subscription - Premium Upgrade',
      }),
    });

    const stkData = await stkRes.json();

    if (stkData.errorCode) {
      return NextResponse.json({ error: stkData.errorMessage }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `STK push initiated for KES ${chargeAmount}. Awaiting user confirmation...`,
      MerchantRequestID: stkData.MerchantRequestID,
      CheckoutRequestID: stkData.CheckoutRequestID,
    });
  } catch (err) {
    console.error('[STK ERROR]:', err);
    return NextResponse.json({ error: 'Failed to initiate STK' }, { status: 500 });
  }
}
