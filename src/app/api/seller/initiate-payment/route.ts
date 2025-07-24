import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Transaction from '@/app/models/transaction';
import Seller from '@/app/models/seller';
import { generateAccessToken, sendSTKPush } from '@/lib/mpesa';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { sellerId, subscriptionType, phoneNumber } = await req.json();

  const amountMap = { basic: 1300, premium: 3000 };
  const amount = amountMap[subscriptionType];
  if (!amount) return NextResponse.json({ error: 'Invalid subscription type' }, { status: 400 });

  const seller = await Seller.findById(sellerId);
  if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 });

  // Check for upgrade case
  let finalAmount = amount;
  if (subscriptionType === 'premium' && seller.shop?.basic?.isActive) {
    finalAmount = 3000 - (seller.shop.basic.amountPaid || 1300);
  }

  const accessToken = await generateAccessToken();
  const stkResponse = await sendSTKPush({
    accessToken,
    phone: phoneNumber,
    amount: finalAmount,
    callbackUrl: 'https://yourdomain.com/api/seller/mpesa-callback',
  });

  const transaction = await Transaction.create({
    sellerId,
    phone: phoneNumber,
    amount: finalAmount,
    subscriptionType,
    status: 'pending',
    transactionId: stkResponse.CheckoutRequestID,
  });

  return NextResponse.json({
    success: true,
    message: 'STK push sent',
    transactionId: stkResponse.CheckoutRequestID,
  });
}
