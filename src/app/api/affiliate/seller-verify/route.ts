import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/dbConnect';
import Seller from '@/app/models/seller';
import Affiliate from '@/app/models/Affiliate';
import Referral from '@/app/models/Referral';

const SECRET_KEY = process.env.JWT_SECRET || 'secret_ecom';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { shopName, transactionId } = await req.json();

    if (!shopName || !transactionId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // ✅ Authenticate affiliate using Bearer token
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token)
      return NextResponse.json(
        { success: false, message: 'Unauthorized: No token provided' },
        { status: 401 }
      );

    let decoded: any;
    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const affiliateId = decoded.id;
    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate)
      return NextResponse.json(
        { success: false, message: 'Affiliate not found' },
        { status: 404 }
      );

    // ✅ Find the seller by shopName
    const seller = await Seller.findOne({ name });
    if (!seller)
      return NextResponse.json(
        { success: false, message: 'Seller not found' },
        { status: 404 }
      );

    // ✅ Validate transactionId
    if (!seller.shop.transactionId)
      return NextResponse.json(
        { success: false, message: 'Seller has no recorded transaction ID' },
        { status: 400 }
      );

    if (seller.shop.transactionId !== transactionId)
      return NextResponse.json(
        { success: false, message: 'Invalid transaction ID' },
        { status: 400 }
      );

    // ✅ Check if already verified
    if (seller.isVerified) {
      return NextResponse.json(
        { success: false, message: 'Seller already verified' },
        { status: 400 }
      );
    }

    // ✅ Determine commission automatically from plan
    const plan = seller.shop.plan?.toLowerCase();
    const commission = plan === 'premium' ? 800 : plan === 'basic' ? 300 : 0;

    if (commission === 0)
      return NextResponse.json(
        { success: false, message: 'No commission applicable for this plan' },
        { status: 400 }
      );

    // ✅ Mark seller as verified
    seller.isVerified = true;
    seller.shop.isActive = true;
    seller.shop.activatedAt = new Date();
    await seller.save();

    // ✅ Create referral record
    const referral = await Referral.create({
      affiliateId,
      sellerId: seller._id,
      name: seller.name,
      plan: seller.shop.plan,
      commission,
      status: 'Pending',
      date: new Date(),
    });

    // ✅ Update affiliate stats
    affiliate.totalEarnings += commission;
    affiliate.pendingPayouts += commission;
    affiliate.referredSellers += 1;
    affiliate.referredSellerIds.push(seller._id);
    await affiliate.save();

    return NextResponse.json({
      success: true,
      message: `Seller verified successfully. KES ${commission} commission added.`,
      referral,
    });
  } catch (error) {
    console.error('Error verifying seller:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while verifying seller' },
      { status: 500 }
    );
  }
}
