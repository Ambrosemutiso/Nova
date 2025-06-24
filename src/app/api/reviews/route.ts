import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
  try {
    const { sellerId, userId, name, rating, comment, verified } = await req.json();

    const reviewsRef = adminDb.collection('reviews');
    const existingReviewQuery = reviewsRef
      .where('sellerId', '==', sellerId)
      .where('userId', '==', userId);
    
    const existingReviewSnap = await existingReviewQuery.get();

    if (!existingReviewSnap.empty) {
      const existingDoc = existingReviewSnap.docs[0];
      await reviewsRef.doc(existingDoc.id).update({
        rating,
        comment,
        verified,
        updatedAt: new Date().toISOString(),
      });
      return NextResponse.json({ message: 'Review updated' });
    }

    await reviewsRef.add({
      sellerId,
      userId,
      name,
      rating,
      comment,
      verified,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: 'Review submitted' });
  } catch (err) {
    console.error('Error submitting review:', err);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
