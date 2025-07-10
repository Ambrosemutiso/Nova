import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Review from '@/app/models/review';
import Product from '@/app/models/product';
import User from '@/app/models/user'; // 🔑 make sure this exists and is correct

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

    // 🔁 Manually attach user info
    const reviewsWithUser = await Promise.all(
      reviews.map(async (review) => {
        const user = await User.findById(review.userId).select('name image');
        return {
          ...review.toObject(),
          userId: {
            _id: user?._id || null,
            name: user?.name || 'Anonymous',
            image: user?.image || null,
          },
        };
      })
    );

    return NextResponse.json({ success: true, data: { reviews: reviewsWithUser } });
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
      productId,
      userId,
      name,
      rating,
      comment,
      verified = false,
    } = body;

    if (!productId || !userId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already reviewed the product
    const existing = await Review.findOne({ productId, userId });

    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      existing.verified = verified;
      existing.name = name;
      await existing.save();
    } else {
      await Review.create({
        productId,
        userId,
        name,
        rating,
        comment,
        verified,
        createdAt: new Date(),
      });
    }

    // Update product's average rating and review count
    const allReviews = await Review.find({ productId });
    const reviewCount = allReviews.length;
    const averageRating =
      reviewCount > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;

    await Product.findByIdAndUpdate(productId, {
      averageRating,
      reviewCount,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/reviews error:', err);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
