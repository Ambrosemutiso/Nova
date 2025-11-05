import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { auth } from './firebaseConfig';

const countryCurrencyMap: Record<string, string> = {
  KE: 'KES',
  UG: 'UGX',
  TZ: 'TZS',
  RW: 'RWF',
  BI: 'BIF',
  ET: 'ETB',
  SO: 'SOS',
  SS: 'SSP',
};

/**
 * 🔹 Start Google sign-in
 * Automatically saves a redirect marker (so modal reopens after redirect)
 */
export const signInWithGoogle = async (role: 'buyer' | 'seller') => {
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');

  // ✅ Save marker before any attempt
  localStorage.setItem('pendingGoogleRedirect', role);

  let country = 'KE';
  try {
    const res = await fetch('https://ipapi.co/json/');
    const geo = await res.json();
    country = geo.country_code || 'KE';
  } catch {
    console.warn('Geo lookup failed, defaulting to KE');
  }

  const currency = countryCurrencyMap[country] || 'USD';

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const token = await user.getIdToken();

    localStorage.removeItem('pendingGoogleRedirect'); // ✅ Done, clear marker

    return {
      name: user.displayName || '',
      email: user.email || '',
      image: user.photoURL || '',
      phoneNumber: user.phoneNumber || null,
      token,
      country,
      currency,
    };
  } catch (error: any) {
    console.warn('Popup failed, using redirect...', error?.code);
    await signInWithRedirect(auth, provider);
    // 🚀 redirect will happen automatically; we’ll handle result later
  }
};

/**
 * 🔹 Handle redirect result (called on mount)
 * Returns Google user info if redirect succeeded
 */
export const checkGoogleRedirectResult = async () => {
  const result = await getRedirectResult(auth);
  if (!result) return null;

  const user = result.user;
  if (!user) return null;

  let country = 'KE';
  try {
    const res = await fetch('https://ipapi.co/json/');
    const geo = await res.json();
    country = geo.country_code || 'KE';
  } catch {
    console.warn('Geo lookup failed, defaulting to KE');
  }

  const currency = countryCurrencyMap[country] || 'USD';
  const token = await user.getIdToken();

  localStorage.removeItem('pendingGoogleRedirect'); // ✅ clear marker now that we’re back

  return {
    name: user.displayName || '',
    email: user.email || '',
    image: user.photoURL || '',
    phoneNumber: user.phoneNumber || null,
    token,
    country,
    currency,
  };
};
