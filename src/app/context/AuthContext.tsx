'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller';
  photoURL: string;
}

interface AuthContextType {
  user: User | null;
  isSeller: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    const buyerData = localStorage.getItem('buyerUser');
    const sellerData = localStorage.getItem('sellerUser');

    if (buyerData) {
      const buyer = JSON.parse(buyerData);
      setUser(buyer);
      setIsSeller(false);
    } else if (sellerData) {
      const seller = JSON.parse(sellerData);
      setUser(seller);
      setIsSeller(true);
    }
  }, []);

  const login = (user: User) => {
    setUser(user);
    setIsSeller(user.role === 'seller');
    localStorage.setItem(user.role === 'seller' ? 'sellerUser' : 'buyerUser', JSON.stringify(user));
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
    <AuthContext.Provider value={{ user, isSeller, login, logout }}>
      {children}
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
