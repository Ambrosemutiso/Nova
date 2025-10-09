import { NextRequest, NextResponse } from 'next/server';
import {dbConnect} from '@/lib/dbConnect';
import Referral from '@/app/models/Referral';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const totalEarnings = await Referral.aggregate([{ $group: { _id: null, total: { $sum: '$commission' } } }]);
    const pendingPayouts = await Referral.countDocuments({ status: 'Pending' });
    const referredSellers = await Referral.countDocuments();
    const conversionRate = referredSellers > 0 ? Math.round((referredSellers / 1000) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalEarnings: totalEarnings[0]?.total || 0,
        pendingPayouts,
        referredSellers,
        conversionRate,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Failed to fetch summary' }, { status: 500 });
  }
}
