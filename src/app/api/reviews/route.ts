import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Review from '@/app/models/review';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const { sellerId, userId, name, rating, comment, verified } = body;

    if (!sellerId || !userId || !rating || !comment || !name) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already reviewed
    const existing = await Review.findOne({ sellerId, userId });

    if (existing) {
      // Update existing review
      existing.rating = rating;
      existing.comment = comment;
      existing.name = name;
      existing.verified = verified;
      await existing.save();
      return NextResponse.json({ success: true, message: 'Review updated' });
    }

    // Create new review
    const newReview = new Review({ sellerId, userId, name, rating, comment, verified });
    await newReview.save();

    return NextResponse.json({ success: true, message: 'Review submitted' });
  } catch (error) {
    console.error('Review error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
