// lib/authUtils.ts
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const signInWithGoogle = async (role: 'buyer' | 'seller') => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photo: user.photoURL,
        role: role,
        createdAt: new Date(),
      });
    }

    return {
      uid: user.uid,
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
