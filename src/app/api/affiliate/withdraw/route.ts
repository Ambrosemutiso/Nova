import { NextResponse } from 'next/server';
import {dbConnect} from '@/lib/dbConnect';
import Affiliate from '@/app/models/Affiliate';
import Withdrawal from '@/app/models/Withdrawal';
import { verifyAffiliateToken } from '@/lib/verifyAffiliateToken'; // JWT middleware helper

export async function POST(req: Request) {
  await dbConnect();

  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized - no token' }, { status: 401 });
    }

    const decoded = verifyAffiliateToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
    }

    const body = await req.json();
    const { phone, amount, method } = body;

    if (!phone || !amount || !method) {
      return NextResponse.json(
        { success: false, message: 'Please fill all fields' },
        { status: 400 }
      );
    }

    const affiliate = await Affiliate.findById(decoded.id);
    if (!affiliate) {
      return NextResponse.json(
        { success: false, message: 'Affiliate not found' },
        { status: 404 }
      );
    }

    if (affiliate.pendingPayouts < amount) {
      return NextResponse.json(
        { success: false, message: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Deduct from pending payouts
    affiliate.pendingPayouts -= amount;
    await affiliate.save();

    // Record withdrawal transaction
    const withdrawal = await Withdrawal.create({
      affiliateId: affiliate._id,
      phone,
      amount,
      method,
      status: 'Pending',
    });

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      balance: affiliate.pendingPayouts,
      withdrawal,
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
