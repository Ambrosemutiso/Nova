// Assuming Firestore
import { db } from '@/lib/firebaseConfig';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  const { sellerId, userId, name, rating, comment, verified } = await req.json();

  const q = query(
    collection(db, 'reviews'),
    where('sellerId', '==', sellerId),
    where('userId', '==', userId)
  );

  const existingReviews = await getDocs(q);
  if (!existingReviews.empty) {
    return new Response(JSON.stringify({ error: 'You have already reviewed this seller.' }), {
      status: 400,
    });
  }

  await addDoc(collection(db, 'reviews'), {
    sellerId,
    userId,
    name,
    rating,
    comment,
    verified,
    date: new Date(),
  });

  return new Response(JSON.stringify({ message: 'Review submitted successfully.' }), { status: 200 });
}
