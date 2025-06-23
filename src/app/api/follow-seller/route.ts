import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { sellerId, userId, action } = await req.json();

    if (!sellerId || !userId || !['follow', 'unfollow'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const docRef = doc(db, 'followers', sellerId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists() && action === 'follow') {
      await setDoc(docRef, { followers: [userId] });
    } else if (action === 'follow') {
      await updateDoc(docRef, { followers: arrayUnion(userId) });
    } else if (action === 'unfollow') {
      await updateDoc(docRef, { followers: arrayRemove(userId) });
    }

    return NextResponse.json({ message: `${action}ed successfully` });
  } catch (err) {
    console.error('Error following/unfollowing seller:', err);
    return NextResponse.json({ error: 'Failed to follow/unfollow seller' }, { status: 500 });
  }
}
