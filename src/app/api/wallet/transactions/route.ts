import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';
import PaymentIntent, { IPaymentIntent } from '@/app/models/paymentIntent';

type LeanPaymentIntent = Omit<IPaymentIntent, keyof Document> & {
  _id: Types.ObjectId;
};

export async function GET(req: NextRequest) {
  await dbConnect();

  const userId = req.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { message: 'Missing userId' },
      { status: 400 }
    );
  }

 const intents = await PaymentIntent.find({
  userId: new Types.ObjectId(userId),
  status: 'paid',
  purpose: { $in: ['wallet', 'order'] },
})
  .sort({ createdAt: -1 })
  .limit(15) // 🔥 SHOW ONLY 5 MOST RECENT
  .lean<LeanPaymentIntent[]>();

const transactions = intents.map(tx => {
  const isCredit = tx.purpose === 'wallet';

  return {
    id: tx._id.toString(),
    type: isCredit ? 'credit' : 'debit',
    amount: tx.amount,
    label: isCredit ? 'Wallet Top Up' : 'Order Payment',
    date: tx.createdAt,
  };
});

  return NextResponse.json(transactions);
}
