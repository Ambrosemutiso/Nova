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

  // ---- 📱 Get phone number from Google People API ----
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
    AF: 'AFN', AL: 'ALL', DZ: 'DZD', AS: 'USD', AD: 'EUR', AO: 'AOA', AI: 'XCD', AQ: 'USD', AG: 'XCD', AR: 'ARS',
    AM: 'AMD', AW: 'AWG', AU: 'AUD', AT: 'EUR', AZ: 'AZN', BS: 'BSD', BH: 'BHD', BD: 'BDT', BB: 'BBD', BY: 'BYN',
    BE: 'EUR', BZ: 'BZD', BJ: 'XOF', BM: 'BMD', BT: 'BTN', BO: 'BOB', BA: 'BAM', BW: 'BWP', BR: 'BRL', BN: 'BND',
    BG: 'BGN', BF: 'XOF', BI: 'BIF', KH: 'KHR', CM: 'XAF', CA: 'CAD', CV: 'CVE', KY: 'KYD', CF: 'XAF', TD: 'XAF',
    CL: 'CLP', CN: 'CNY', CO: 'COP', KM: 'KMF', CG: 'XAF', CD: 'CDF', CR: 'CRC', HR: 'EUR', CU: 'CUP', CY: 'EUR',
    CZ: 'CZK', DK: 'DKK', DJ: 'DJF', DM: 'XCD', DO: 'DOP', EC: 'USD', EG: 'EGP', SV: 'USD', GQ: 'XAF', ER: 'ERN',
    EE: 'EUR', SZ: 'SZL', ET: 'ETB', FJ: 'FJD', FI: 'EUR', FR: 'EUR', GA: 'XAF', GM: 'GMD', GE: 'GEL', DE: 'EUR',
    GH: 'GHS', GI: 'GIP', GR: 'EUR', GL: 'DKK', GD: 'XCD', GU: 'USD', GT: 'GTQ', GN: 'GNF', GW: 'XOF', GY: 'GYD',
    HT: 'HTG', HN: 'HNL', HK: 'HKD', HU: 'HUF', IS: 'ISK', IN: 'INR', ID: 'IDR', IR: 'IRR', IQ: 'IQD', IE: 'EUR',
    IL: 'ILS', IT: 'EUR', JM: 'JMD', JP: 'JPY', JO: 'JOD', KZ: 'KZT', KE: 'KES', KI: 'AUD', KR: 'KRW', KW: 'KWD',
    KG: 'KGS', LA: 'LAK', LV: 'EUR', LB: 'LBP', LS: 'LSL', LR: 'LRD', LY: 'LYD', LT: 'EUR', LU: 'EUR', MO: 'MOP',
    MG: 'MGA', MW: 'MWK', MY: 'MYR', MV: 'MVR', ML: 'XOF', MT: 'EUR', MH: 'USD', MR: 'MRU', MU: 'MUR', MX: 'MXN',
    FM: 'USD', MD: 'MDL', MC: 'EUR', MN: 'MNT', ME: 'EUR', MA: 'MAD', MZ: 'MZN', MM: 'MMK', NA: 'NAD', NR: 'AUD',
    NP: 'NPR', NL: 'EUR', NZ: 'NZD', NI: 'NIO', NE: 'XOF', NG: 'NGN', NU: 'NZD', NF: 'AUD', MK: 'MKD', MP: 'USD',
    NO: 'NOK', OM: 'OMR', PK: 'PKR', PW: 'USD', PA: 'PAB', PG: 'PGK', PY: 'PYG', PE: 'PEN', PH: 'PHP', PL: 'PLN',
    PT: 'EUR', PR: 'USD', QA: 'QAR', RO: 'RON', RU: 'RUB', RW: 'RWF', KN: 'XCD', LC: 'XCD', VC: 'XCD', WS: 'WST',
    SM: 'EUR', ST: 'STN', SA: 'SAR', SN: 'XOF', RS: 'RSD', SC: 'SCR', SL: 'SLL', SG: 'SGD', SK: 'EUR', SI: 'EUR',
    SB: 'SBD', SO: 'SOS', ZA: 'ZAR', SS: 'SSP', ES: 'EUR', LK: 'LKR', SD: 'SDG', SR: 'SRD', SE: 'SEK', CH: 'CHF',
    SY: 'SYP', TW: 'TWD', TJ: 'TJS', TZ: 'TZS', TH: 'THB', TL: 'USD', TG: 'XOF', TO: 'TOP', TT: 'TTD', TN: 'TND',
    TR: 'TRY', TM: 'TMT', TV: 'AUD', UG: 'UGX', UA: 'UAH', AE: 'AED', GB: 'GBP', US: 'USD', UY: 'UYU', UZ: 'UZS',
    VU: 'VUV', VE: 'VES', VN: 'VND', WF: 'XPF', EH: 'MAD', YE: 'YER', ZM: 'ZMW', ZW: 'ZWL'
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

  return data.user;
};
