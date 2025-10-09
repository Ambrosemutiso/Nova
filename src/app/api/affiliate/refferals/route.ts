import { NextRequest, NextResponse } from 'next/server';
import {dbConnect} from '@/lib/dbConnect';
import Referral from '@/app/models/Referral';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const referrals = await Referral.find().sort({ date: -1 });

    // Mock chart data (you can replace this with monthly grouping)
    const chart = [
      { month: 'Jan', earnings: 1200, referrals: 8 },
      { month: 'Feb', earnings: 900, referrals: 5 },
      { month: 'Mar', earnings: 1600, referrals: 10 },
      { month: 'Apr', earnings: 800, referrals: 3 },
    ];

    return NextResponse.json({ success: true, data: referrals, chart });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Failed to fetch referrals' }, { status: 500 });
  }
}
