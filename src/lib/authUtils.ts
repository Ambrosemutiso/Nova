import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';

export const signInWithGoogle = async (role: 'buyer' | 'seller') => {
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');
  provider.addScope('https://www.googleapis.com/auth/user.phonenumbers.read');

  try {
    // --- Try popup first ---
    const result = await signInWithPopup(auth, provider);
    return await handleLoginResult(result, role);
  } catch (error: any) {
    console.warn('Popup sign-in failed, trying redirect...', error?.code);

    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.code === 'auth/popup-blocked'
    ) {
      // --- Fallback to redirect ---
      await signInWithRedirect(auth, provider);

      const result = await getRedirectResult(auth);
      if (result) {
        return await handleLoginResult(result, role);
      }
    }

    console.error('Google Sign-in Error:', error);
    throw error;
  }
};

// --- Extracted login handler ---
const handleLoginResult = async (result: any, role: 'buyer' | 'seller') => {
  const user = result.user;
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential?.accessToken;

  // ---- 📱 Try to get phone number from Google People API ----
  let phoneNumber: string | null = null;
  if (accessToken) {
    try {
      const phoneRes = await fetch(
        'https://people.googleapis.com/v1/people/me?personFields=phoneNumbers',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (phoneRes.ok) {
        const phoneData = await phoneRes.json();
        phoneNumber = phoneData?.phoneNumbers?.[0]?.value || null;
      }
    } catch (err) {
      console.warn('Phone lookup failed', err);
    }
  }

  // ---- 🌍 ISO Country → Currency map ----
  const countryCurrencyMap: Record<string, string> = {
    KE: 'KES',
    US: 'USD',
    GB: 'GBP',
    IN: 'INR',
    NG: 'NGN',
    TZ: 'TZS',
    UG: 'UGX',
    // ... (keep full map from your version)
  };

  let country: string | undefined;
  let currency: string | undefined;

  if (phoneNumber) {
    if (phoneNumber.startsWith('+1')) country = 'US';
    else if (phoneNumber.startsWith('+44')) country = 'GB';
    else if (phoneNumber.startsWith('+254')) country = 'KE';
    else if (phoneNumber.startsWith('+91')) country = 'IN';
    else if (phoneNumber.startsWith('+234')) country = 'NG';
    else if (phoneNumber.startsWith('+255')) country = 'TZ';
    else if (phoneNumber.startsWith('+256')) country = 'UG';
  }

  // 🌐 fallback: IP-based geolocation if phone is missing
  if (!country) {
    try {
      const geoRes = await fetch('https://ipapi.co/json/');
      const geoData = await geoRes.json();
      country = geoData.country_code;
    } catch (err) {
      console.warn('Geo lookup failed', err);
    }
  }

  if (country) {
    currency = countryCurrencyMap[country] || 'USD';
  }

  // ---- 📦 Build user data ----
  const userData = {
    name: user.displayName,
    email: user.email,
    image: user.photoURL,
    phoneNumber,
    country,
    currency,
    role,
    isPhoneVerified: !!phoneNumber, // ✅ mark verified only if Google gave us a number
  };

  // ---- 🔥 Save to Firestore ----
  const docRef =
    role === 'buyer'
      ? doc(collection(db, 'users'), user.uid)
      : doc(collection(db, 'sellers'), user.uid);
  await setDoc(docRef, userData, { merge: true });

  // ---- 🗄️ Save to MongoDB ----
  const endpoint =
    role === 'buyer'
      ? '/api/auth/google-login'
      : '/api/seller/google-login';

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to log in');

  // ---- ✅ Return full user + needsPhoneNumber flag ----
  return {
    ...data.user,
    needsPhoneNumber: !userData.phoneNumber,
  };
};
