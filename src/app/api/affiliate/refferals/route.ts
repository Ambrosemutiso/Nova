import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/dbConnect';
import Referral from '@/app/models/Referral';
import Withdrawal from '@/app/models/Withdrawal';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_ecom';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const authHeader = req.headers.get('authorization');
    if (!authHeader)
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const affiliateId = decoded.id;

    // 🔹 Get all referrals for this affiliate
    const referrals = await Referral.find({ affiliateId }).sort({ date: -1 });

    // 🔹 Monthly chart data
    const monthlyData = await Referral.aggregate([
      { $match: { affiliateId } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          earnings: { $sum: '$commission' },
          referrals: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const chart = monthlyData.map((m) => ({
      month: monthNames[m._id.month - 1],
      earnings: m.earnings,
      referrals: m.referrals,
    }));

    // 🔹 Plan type breakdown (Basic vs Premium)
    const planBreakdown = await Referral.aggregate([
      { $match: { affiliateId } },
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 },
        },
      },
    ]);

    // 🔹 Withdraw method breakdown (Mpesa vs Airtel)
    const withdrawBreakdown = await Withdrawal.aggregate([
      { $match: { affiliateId } },
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: referrals,
      chart,
      breakdown: {
        plans: planBreakdown.map((p) => ({
          name: `${p._id} Plan`,
          value: p.count,
        })),
        withdraws: withdrawBreakdown.map((m) => ({
          method: m._id,
          value: m.count,
        })),
      },
    });
  } catch (err) {
    console.error('Affiliate referral error:', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch referrals' }, { status: 500 });
  }
}
