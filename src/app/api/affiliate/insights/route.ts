import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/dbConnect';
import Referral from '@/app/models/Referral';
import Withdrawal from '@/app/models/Withdrawal';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_ecom';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // --- Extract and verify JWT ---
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const affiliateId = decoded.id;

    // --- Aggregate referral breakdown by plan ---
    const planBreakdown = await Referral.aggregate([
      { $match: { affiliateId } },
      { $group: { _id: '$sellerPlan', count: { $sum: 1 }, totalCommission: { $sum: '$commission' } } },
      { $project: { plan: '$_id', count: 1, totalCommission: 1, _id: 0 } },
    ]);

    // --- Aggregate withdrawal breakdown by method ---
    const withdrawBreakdown = await Withdrawal.aggregate([
      { $match: { affiliateId } },
      { $group: { _id: '$method', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
      { $project: { method: '$_id', count: 1, totalAmount: 1, _id: 0 } },
    ]);

    // --- Compute totals ---
    const totalCommission = planBreakdown.reduce((sum, p) => sum + (p.totalCommission || 0), 0);
    const totalWithdrawn = withdrawBreakdown.reduce((sum, w) => sum + (w.totalAmount || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        totalCommission,
        totalWithdrawn,
        planBreakdown,
        withdrawBreakdown,
      },
    });
  } catch (err: any) {
    console.error('Affiliate Insights Error:', err);
    if (err.name === 'JsonWebTokenError') {
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
