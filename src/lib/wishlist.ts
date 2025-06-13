// utils/wishlist.ts
import { Product } from '@/app/types/product'; 

const WISHLIST_KEY = 'wishlist';

export const getWishlist = (): Product[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(WISHLIST_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addToWishlist = (product: Product): void => {
  const current = getWishlist();
  const exists = current.some((item) => item._id === product._id);
  if (!exists) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify([...current, product]));
  }
};

export const removeFromWishlist = (productId: string): void => {
  const current = getWishlist();
  const updated = current.filter((item) => item._id !== productId);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
};

export const isInWishlist = (productId: string): boolean => {
  const current = getWishlist();
  return current.some((item) => item._id === productId);
};
