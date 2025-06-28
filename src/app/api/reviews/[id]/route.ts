// /api/reviews/[id]/route.ts
import { db } from '@/lib/firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    await deleteDoc(doc(db, 'reviews', id));
    return new Response(JSON.stringify({ message: 'Review deleted' }), { status: 200 });
    } catch (error) {
    console.error('Error fetching reviews:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete review' }), { status: 500 });
  }
}
