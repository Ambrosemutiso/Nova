import { NextRequest, NextResponse } from 'next/server';
import { dbConnect }from '@/lib/dbConnect';
import Review from '@/app/models/review';

// GET reviews for a product
export async function GET(
  req: NextRequest,
    context: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await context.params;
    await dbConnect();
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ message: 'Error fetching reviews' }, { status: 500 });
  }
}

// POST a new review
export async function POST(
  req: NextRequest,
    context: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await context.params;
    await dbConnect();
    const body = await req.json();
    const { userName, comment, rating } = body;

    const review = await Review.create({
      productId,
      userName,
      comment,
      rating,
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ message: 'Error creating review' }, { status: 500 });
  }
}
