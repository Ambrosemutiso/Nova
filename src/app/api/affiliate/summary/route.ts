import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Referral from '@/app/models/Referral';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // 🟢 Total earnings from all referrals
    const totalEarningsResult = await Referral.aggregate([
      { $group: { _id: null, total: { $sum: '$commission' } } },
    ]);
    const totalEarnings = totalEarningsResult[0]?.total || 0;

    // 🟡 Pending payouts = sum of commissions still pending
    const pendingPayoutsResult = await Referral.aggregate([
      { $match: { status: 'Pending' } },
      { $group: { _id: null, total: { $sum: '$commission' } } },
    ]);
    const pendingPayouts = pendingPayoutsResult[0]?.total || 0;

    // 🟣 Total referred sellers
    const referredSellers = await Referral.countDocuments();

    // 🔵 Conversion rate (for display purposes)
    const conversionRate =
      referredSellers > 0 ? Math.round((referredSellers / 1000) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalEarnings,
        pendingPayouts,
        referredSellers,
        conversionRate,
      },
    });
  } catch (err) {
    console.error('Affiliate summary error:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch summary' },
      { status: 500 }
    );
  }
}
