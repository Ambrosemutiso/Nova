// /api/seller/mpesa-callback.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Transaction from '@/app/models/shopTransaction';
import Seller from '@/app/models/seller';

export async function POST(req: NextRequest) {
  await dbConnect();

  const body = await req.json();
  const callback = body.Body?.stkCallback;

  if (!callback) return NextResponse.json({ error: 'Invalid callback' }, { status: 400 });

  const { CheckoutRequestID, ResultCode, CallbackMetadata } = callback;

  if (ResultCode === 0) {
    const mpesaReceipt = CallbackMetadata?.Item?.find((i) => i.Name === 'MpesaReceiptNumber')?.Value;

    const txn = await Transaction.findOneAndUpdate(
      { transactionId: CheckoutRequestID },
      { status: 'success', mpesaReceiptNumber: mpesaReceipt },
      { new: true }
    );

    const seller = await Seller.findById(txn.sellerId);

    const now = new Date();
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    const trxId = txn.transactionId;

    if (txn.subscriptionType === 'basic') {
      seller.shop.basic = {
        isActive: true,
        activatedAt: now,
        expiresAt: expiry,
        amountPaid: txn.amount,
        transactionId: trxId,
      };
    } else if (txn.subscriptionType === 'premium') {
      seller.shop.premium = {
        isActive: true,
        activatedAt: now,
        expiresAt: expiry,
        amountPaid: txn.amount,
        transactionId: trxId,
      };
    }

    await seller.save();

    return NextResponse.json({ success: true });
  }

  // Failed transaction
  await Transaction.findOneAndUpdate(
    { transactionId: CheckoutRequestID },
    { status: 'failed' }
  );

  return NextResponse.json({ success: false });
}
