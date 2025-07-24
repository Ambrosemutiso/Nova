import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Seller from '@/app/models/seller';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { sellerId, subscriptionType } = await req.json(); // Expect "basic" or "premium"

    if (!sellerId || !subscriptionType) {
      return NextResponse.json({ error: 'Missing sellerId or subscriptionType' }, { status: 400 });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const now = new Date();
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1); // valid for 1 year

    const transactionId = 'TRX-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    if (subscriptionType === 'basic') {
      // If already subscribed to basic
      if (seller.shop?.basic?.isActive && new Date(seller.shop.basic.expiresAt) > now) {
        return NextResponse.json({ error: 'Basic subscription already active' }, { status: 400 });
      }

      seller.shop.basic = {
        isActive: true,
        activatedAt: now,
        expiresAt: expiry,
        amountPaid: 1300,
        transactionId,
      };
    }

    if (subscriptionType === 'premium') {
      const hasBasic = seller.shop?.basic?.isActive;

      let amountPaid = 3000;

      // Top-up upgrade logic if basic exists
      if (hasBasic) {
        const basicAmount = seller.shop.basic.amountPaid || 1300;
        amountPaid = 3000 - basicAmount;
      }

      seller.shop.premium = {
        isActive: true,
        activatedAt: now,
        expiresAt: expiry,
        amountPaid,
        transactionId,
      };
    }

    await seller.save();

    return NextResponse.json({
      success: true,
      message: `${subscriptionType} subscription activated`,
      shop: seller.shop,
    });

  } catch (error) {
    console.error('[Shop Subscription Error]:', error);
    return NextResponse.json({ error: 'Failed to activate shop subscription' }, { status: 500 });
  }
}
