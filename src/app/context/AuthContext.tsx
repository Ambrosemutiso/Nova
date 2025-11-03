'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

// 🌍 Full ISO country to currency map
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
  VU: 'VUV', VE: 'VES', VN: 'VND', YE: 'YER', ZM: 'ZMW', ZW: 'ZWL'
};

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller';
  image: string;
  phoneNumber?: string;
  country?: string;
  currency?: string;
}

interface AuthContextType {
  user: User | null;
  isSeller: boolean;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSeller, setIsSeller] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buyerData = localStorage.getItem('buyerUser');
    const sellerData = localStorage.getItem('sellerUser');

    let storedUser: User | null = null;

    if (sellerData) {
      storedUser = JSON.parse(sellerData);
      setIsSeller(true);
    } else if (buyerData) {
      storedUser = JSON.parse(buyerData);
      setIsSeller(false);
    }

    if (storedUser?.phoneNumber) {
      const parsed = parsePhoneNumberFromString(storedUser.phoneNumber);
      if (parsed?.country) {
        const countryCode = parsed.country;
        storedUser.country = countryCode;
        storedUser.currency = countryCurrencyMap[countryCode] || 'USD';
      }
    }

    if (storedUser) setUser(storedUser);

    setLoading(false);
  }, []);

  const login = (user: User) => {
    // also auto-derive country/currency on login
    if (user.phoneNumber) {
      const parsed = parsePhoneNumberFromString(user.phoneNumber);
      if (parsed?.country) {
        const countryCode = parsed.country;
        user.country = countryCode;
        user.currency = countryCurrencyMap[countryCode] || 'USD';
      }
    }

    setUser(user);
    const isSeller = user.role === 'seller';
    setIsSeller(isSeller);
    localStorage.setItem(isSeller ? 'sellerUser' : 'buyerUser', JSON.stringify(user));
    localStorage.setItem('userId', user._id);
  };

  const logout = () => {
    setUser(null);
    setIsSeller(false);
    localStorage.removeItem('buyerUser');
    localStorage.removeItem('sellerUser');
    localStorage.removeItem('userId');
  };

  return (
    <AuthContext.Provider value={{ user, isSeller, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
