'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

// 🌍 Full ISO country to currency map
const countryCurrencyMap: Record<string, string> = {
  KE: 'KES', UG: 'UGX', TZ: 'TZS', RW: 'RWF',
};

export interface User {
  _id?: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller';
  image?: string;
  phoneNumber?: string;
  country?: string;
  currency?: string;
  token?: string;
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

  // ✅ Load user session from localStorage
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
        storedUser.country = parsed.country;
        storedUser.currency = countryCurrencyMap[parsed.country] || 'USD';
      }
    }

    if (storedUser) setUser(storedUser);
    setLoading(false);
  }, []);

  // ✅ Universal login handler for both buyer/seller
  const login = (user: User) => {
    let derivedCountry = user.country;
    let derivedCurrency = user.currency;

    // Try to auto-derive from phone number if not set
    if (!derivedCountry && user.phoneNumber) {
      const parsed = parsePhoneNumberFromString(user.phoneNumber);
      if (parsed?.country) {
        derivedCountry = parsed.country;
        derivedCurrency = countryCurrencyMap[parsed.country] || 'USD';
      }
    }

    const normalizedUser = {
      ...user,
      country: derivedCountry || 'KE',
      currency: derivedCurrency || 'KES',
    };

    setUser(normalizedUser);
    const seller = normalizedUser.role === 'seller';
    setIsSeller(seller);

    localStorage.setItem(seller ? 'sellerUser' : 'buyerUser', JSON.stringify(normalizedUser));
    if (normalizedUser.token) localStorage.setItem('token', normalizedUser.token);
  };

  // ✅ Clear both buyer/seller sessions
  const logout = () => {
    setUser(null);
    setIsSeller(false);
    localStorage.removeItem('buyerUser');
    localStorage.removeItem('sellerUser');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, isSeller, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ✅ Hook for accessing Auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
