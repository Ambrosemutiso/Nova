'use client';

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

    // Save to Firestore
    await setDoc(doc(collection(db, 'users'), user.uid), userData, { merge: true });

    // Save to MongoDB
    const res = await fetch('/api/auth/google-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to log in');
    return data.user;
  } catch (error) {
    console.error('Firebase Google Sign-in Error:', error);
    throw error;
  }
};
