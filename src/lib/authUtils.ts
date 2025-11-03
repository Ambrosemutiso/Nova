import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';

/**
 * 🔹 Google Sign-in (login or register)
 */
export const signInWithGoogle = async (
  role: 'buyer' | 'seller',
  mode: 'login' | 'register' = 'login'
) => {
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');

  try {
    const result = await signInWithPopup(auth, provider);
    return await handleLoginResult(result, role, mode);
  } catch (error: any) {
    console.warn('Popup failed, trying redirect...', error?.code);
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.code === 'auth/popup-blocked'
    ) {
      await signInWithRedirect(auth, provider);
      const result = await getRedirectResult(auth);
      if (result) return await handleLoginResult(result, role, mode);
    }
    console.error('Google Sign-in Error:', error);
    throw error;
  }
};

/**
 * 🔹 Email/Password Authentication
 */
export const handleEmailAuth = async (
  mode: 'login' | 'register',
  email: string,
  password: string,
  name: string,
  role: 'buyer' | 'seller'
) => {
  try {
    let user;

    if (mode === 'register') {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      user = result.user;
    } else {
      const result = await signInWithEmailAndPassword(auth, email, password);
      user = result.user;
    }

    const userData = await buildUserData(user, name, role);
    await saveUserToFirestoreAndMongo(userData, role, mode);
    return userData;
  } catch (error: any) {
    console.error('Email auth error:', error);
    throw new Error(error.message || `Failed to ${mode}`);
  }
};

/**
 * 🔹 Password Reset
 */
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw new Error(error.message || 'Failed to send password reset email');
  }
};

/**
 * 🔹 Common handler for successful Google login
 */
const handleLoginResult = async (
  result: any,
  role: 'buyer' | 'seller',
  mode: 'login' | 'register'
) => {
  const user = result.user;
  const userData = await buildUserData(user, user.displayName, role);
  await saveUserToFirestoreAndMongo(userData, role, mode);
  return userData;
};

/**
 * 🔹 Builds unified user object with geo-detected country & currency
 */
const buildUserData = async (user: any, name: string, role: 'buyer' | 'seller') => {
  const countryCurrencyMap: Record<string, string> = {
    KE: 'KES',
    UG: 'UGX',
    TZ: 'TZS',
    RW: 'RWF',
  };

  let country = 'KE';
  try {
    const geoRes = await fetch('https://ipapi.co/json/');
    const geoData = await geoRes.json();
    country = geoData.country_code || 'KE';
  } catch {
    console.warn('Geo lookup failed, defaulting to KE');
  }

  const currency = countryCurrencyMap[country] || 'USD';
  const token = await user.getIdToken();

  return {
    name: name || user.displayName || '',
    email: user.email || '',
    image: user.photoURL || '',
    phoneNumber: user.phoneNumber || null,
    country,
    currency,
    role,
    token,
    isPhoneVerified: !!user.phoneNumber,
  };
};

/**
 * 🔹 Saves user to Firestore and MongoDB
 */
const saveUserToFirestoreAndMongo = async (
  userData: any,
  role: 'buyer' | 'seller',
  mode: 'login' | 'register'
) => {
  const docRef =
    role === 'buyer'
      ? doc(collection(db, 'users'), userData.email)
      : doc(collection(db, 'sellers'), userData.email);

  await setDoc(docRef, userData, { merge: true });

  const endpoint =
    role === 'buyer' ? '/api/auth/google-login' : '/api/seller/google-login';

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'email',
      mode,
      ...userData,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to save user in backend');
  }

  return data.user;
};
