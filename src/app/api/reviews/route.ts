// app/api/reviews/route.ts
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Review from '@/app/models/review';
import Seller from '@/app/models/seller';

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const sellerId = searchParams.get('sellerId');

  if (!sellerId) {
    return NextResponse.json({ success: false, message: 'Missing sellerId' }, { status: 400 });
  }

  try {
    // Fetch all reviews for the seller
    const reviews = await Review.find({ sellerId }).populate('userId', 'name image').sort({ createdAt: -1 });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    // Update seller's averageRating and reviewCount
    await Seller.findByIdAndUpdate(sellerId, {
      averageRating,
      reviewCount: reviews.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        averageRating,
        reviewCount: reviews.length,
      },
    });
  } catch (err) {
    console.error('Review fetch error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
