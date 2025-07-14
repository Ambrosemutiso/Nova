import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import WithdrawRequest from '@/app/models/withdrawRequest';

export async function POST(req: NextRequest) {
  await dbConnect();

  const { sellerId, amount, method, phoneNumber } = await req.json();

  if (!sellerId || !amount || !method || !phoneNumber) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const withdraw = await WithdrawRequest.create({
      sellerId,
      amount,
      method,
      phoneNumber,
    });

    return NextResponse.json({ success: true, withdraw });
  } catch (error) {
    console.error('Withdraw error:', error);
    return NextResponse.json({ error: 'Withdrawal failed' }, { status: 500 });
  }
}
