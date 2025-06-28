import { NextResponse } from 'next/server';
import { getSellerReviews } from '@/lib/getSellerDetails';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const reviews = await getSellerReviews(params.id);
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
