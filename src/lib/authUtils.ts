// lib/authUtils.ts
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const signInWithGoogle = async (role: 'buyer' | 'seller') => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Save to Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        _id: user.uid,
        email: user.email,
        name: user.displayName,
        photo: user.photoURL,
        role,
        createdAt: new Date(),
      });
    }

    // 🔁 Sync to MongoDB via API
    await fetch('/api/sync-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _id: user.uid,
        email: user.email,
        name: user.displayName,
        photo: user.photoURL,
        role,
      }),
    });

    return {
      _id: user.uid,
      email: user.email,
      name: user.displayName,
      photo: user.photoURL,
      role,
    };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    return null;
  }
};
