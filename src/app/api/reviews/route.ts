import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Review from '@/app/models/review';
import Seller from '@/app/models/seller';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');

    if (!sellerId) {
      return NextResponse.json({ error: 'Missing sellerId' }, { status: 400 });
    }

    const reviews = await Review.find({ sellerId })
      .populate('userId', 'name image') // Ensure `User` schema is linked
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: { reviews } });
  } catch (error) {
    console.error('GET /api/reviews error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const {
      sellerId,
      userId,
      name,
      rating,
      comment,
      verified = false,
    } = body;

    if (!sellerId || !userId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for existing review
    const existing = await Review.findOne({ sellerId, userId });

    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      existing.verified = verified;
      existing.name = name;
      await existing.save();
    } else {
      await Review.create({
        sellerId,
        userId,
        name,
        rating,
        comment,
        verified,
        createdAt: new Date(),
      });
    }

    // Update seller rating
    const allReviews = await Review.find({ sellerId });
    const reviewCount = allReviews.length;
    const averageRating =
      reviewCount > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;

    await Seller.findByIdAndUpdate(sellerId, {
      averageRating,
      reviewCount,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/reviews error:', err);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
