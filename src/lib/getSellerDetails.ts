// lib/getSellerDetails.ts
import { db } from './firebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
export const getSellerInfo = async (sellerId: string) => {
  try {
    const sellerDocRef = doc(db, 'users', sellerId);
    const sellerDoc = await getDoc(sellerDocRef);
    const followersDoc = await getDoc(doc(db, 'followers', sellerId));
    console.log('[getSellerInfo] seller exists:', sellerDoc.exists());
    return {
      ...(sellerDoc.exists() ? sellerDoc.data() : {}),
      followers: followersDoc.exists() ? followersDoc.data().followers || [] : [],
    };
  } catch (err) {
    console.error('Error fetching seller info:', err);
    return { followers: [] }; 
  }
};
export const getSellerReviews = async (sellerId: string) => {
  const reviewsQuery = await getDocs(collection(db, 'reviews'));
  const filtered: any[] = [];
  reviewsQuery.forEach((doc) => {
    const allReviews = doc.data().reviews || [];
    allReviews.forEach((r: any) => {
      if (r.sellerId === sellerId && r.rating >= 4) {
        filtered.push(r);
      }
    });
  });
  return filtered.sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);
};