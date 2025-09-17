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

      const now = new Date();
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);

      await Seller.findByIdAndUpdate(sellerId, {
        $set: {
          shop: {
            isActive: true,
            activatedAt: now,
            expiresAt: expiry,
            amountPaid: amount || 1300,
            transactionId: mpesaReceipt,
          },
        },
      });

      console.log('✅ Shop activated for seller', sellerId);
    } else {
      console.log('❌ Payment failed or cancelled for seller', sellerId);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Callback Error]:', err);
    return NextResponse.json({ error: 'Callback error' }, { status: 500 });
  }
}
