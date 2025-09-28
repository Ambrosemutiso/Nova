import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Seller from '@/app/models/seller';

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  try {
    const callback = body?.Body?.stkCallback;
    if (!callback) {
      return NextResponse.json({ error: 'Invalid callback body' }, { status: 400 });
    }

    const resultCode = callback.ResultCode;

    // Seller ID comes from AccountReference
    const sellerId = callback?.CallbackMetadata?.Item?.find(
      (i: any) => i.Name === 'AccountReference'
    )?.Value;

    if (resultCode === 0 && sellerId) {
      const amount = callback.CallbackMetadata.Item.find(
        (i: any) => i.Name === 'Amount'
      )?.Value;

      const mpesaReceipt = callback.CallbackMetadata.Item.find(
        (i: any) => i.Name === 'MpesaReceiptNumber'
      )?.Value;

      // Figure out the package type
      let packageType: 'Basic' | 'Premium' | 'Unknown' = 'Unknown';
      if (amount === 1300) packageType = 'Basic';
      if (amount === 3000) packageType = 'Premium';
      if (amount === 1700) packageType = 'Premium'; // top-up from Basic → Premium

      const now = new Date();
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1); // 1-year subscription

      // Update seller record
      await Seller.findByIdAndUpdate(sellerId, {
        $set: {
          subscriptionTier: packageType,
          'shop.isActive': true,
          'shop.activatedAt': now,
          'shop.expiresAt': expiry,
          'shop.amountPaid': amount,
          'shop.transactionId': mpesaReceipt,
          'shop.package': packageType,
        },
      });

      console.log(`✅ Seller ${sellerId} upgraded to ${packageType} package`);
    } else {
      console.log('❌ Payment failed or cancelled for seller', sellerId);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Callback Error]:', err);
    return NextResponse.json({ error: 'Callback error' }, { status: 500 });
  }
}
