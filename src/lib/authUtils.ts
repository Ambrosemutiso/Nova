import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';

export const signInWithGoogle = async (role: 'buyer' | 'seller') => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userData = {
      name: user.displayName,
      email: user.email,
      image: user.photoURL,
      role,
    };

    // ✅ Save to Firestore (Buyer and Seller separated by collection or doc ID prefix)
    const docRef = role === 'buyer'
      ? doc(collection(db, 'users'), user.uid)
      : doc(collection(db, 'sellers'), user.uid);
    await setDoc(docRef, userData, { merge: true });

    // ✅ Save to correct MongoDB model based on role
    const endpoint = role === 'buyer'
      ? '/api/auth/google-login'
      : '/api/seller/google-login'; // you need this route

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to log in');
    return data.user;
  } catch (error) {
    console.error('Google Sign-in Error:', error);
    throw error;
  }
};

