// app/api/seller/top-up/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Seller from '@/app/models/seller';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { sellerId, amount } = body;

    if (!sellerId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const currentTotal = seller.subscription?.totalPaid || 0;
    const newTotal = currentTotal + amount;

    // Determine subscription type based on new total
    const newSubscriptionType = newTotal >= 3000 ? 'premium' : 'basic';

    // Update subscription data
    seller.subscription = {
      type: newSubscriptionType,
      totalPaid: newTotal,
      lastPaymentDate: new Date(),
    };

    // Optional: Update shop amountPaid for tracking
    seller.shop.amountPaid = newTotal;

    await seller.save();

    return NextResponse.json({
      success: true,
      newSubscription: seller.subscription,
      message: newSubscriptionType === 'premium'
        ? 'Upgraded to Premium!'
        : `Ksh ${3000 - newTotal} remaining to upgrade to Premium.`,
    });
  } catch (err) {
    console.error('Top-up error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
