import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';
import Referral from '@/app/models/Referral';
import Withdrawal from '@/app/models/Withdrawal';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_ecom';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const authHeader = req.headers.get('authorization');
    if (!authHeader)
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );

    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // 🟢 Convert affiliateId to ObjectId
    const affiliateId = new mongoose.Types.ObjectId(decoded.id);
    console.log("Affiliate ID:", affiliateId);
console.log("Referral count:", await Referral.countDocuments({ affiliateId }));


    // 🔹 Fetch referrals for this affiliate
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

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const chart = monthlyData.map((m) => ({
      month: monthNames[m._id.month - 1],
      earnings: m.earnings,
      referrals: m.referrals,
    }));

    // 🔹 Plan breakdown (case-insensitive)
    const planBreakdown = await Referral.aggregate([
      { $match: { affiliateId } },
      {
        $group: {
          _id: { $toLower: '$plan' },
          count: { $sum: 1 },
        },
      },
    ]);

    // 🔹 Withdraw method breakdown (case-insensitive)
    const withdrawBreakdown = await Withdrawal.aggregate([
      { $match: { affiliateId } },
      {
        $group: {
          _id: { $toLower: '$method' },
          count: { $sum: 1 },
        },
      },
    ]);

    // 🧩 Format breakdown data for frontend
    const breakdown = {
      plans: planBreakdown.map((p) => ({
        name: p._id
          ? `${p._id.charAt(0).toUpperCase() + p._id.slice(1)} Plan`
          : 'Unknown Plan',
        value: p.count,
      })),
      withdrawMethods: withdrawBreakdown.map((m) => ({
        name: m._id
          ? m._id.charAt(0).toUpperCase() + m._id.slice(1)
          : 'Unknown',
        value: m.count,
      })),
    };

    return NextResponse.json({
      success: true,
      data: referrals,
      chart,
      breakdown,
    });
  } catch (err) {
    console.error('Affiliate referrals route error:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch affiliate referrals' },
      { status: 500 }
    );
  }
}
