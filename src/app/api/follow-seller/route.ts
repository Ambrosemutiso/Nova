import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin'; // Use admin SDK
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: Request) {
  try {
    const { sellerId, userId, action } = await req.json();

    if (!sellerId || !userId || !['follow', 'unfollow'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const docRef = adminDb.collection('followers').doc(sellerId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      if (action === 'follow') {
        await docRef.set({ followers: [userId] });
      } else {
        return NextResponse.json({ error: 'Nothing to unfollow' }, { status: 400 });
      }
    } else {
      await docRef.update({
        followers:
          action === 'follow'
            ? FieldValue.arrayUnion(userId)
            : FieldValue.arrayRemove(userId),
      });
    }

    return NextResponse.json({ message: `${action} successful` });
  } catch (err) {
    console.error('Error updating follow status:', err);
    return NextResponse.json({ error: 'Failed to update follow status' }, { status: 500 });
  }
}
