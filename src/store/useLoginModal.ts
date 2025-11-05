'use client';

import { create } from 'zustand';

interface GoogleUserData {
  name?: string;
  email?: string;
  image?: string;
  country?: string;
  currency?: string;
  token?: string;
}

interface LoginModalState {
  isOpen: boolean;
  role: 'buyer' | 'seller' | null;
  googleUserData: GoogleUserData | null;
  openLoginModal: (role?: 'buyer' | 'seller') => void;
  closeLoginModal: () => void;
  setPrefillGoogleData: (data: GoogleUserData | null) => void;
  clearPrefill: () => void;
}

export const useLoginModal = create<LoginModalState>((set) => ({
  isOpen: false,
  role: null,
  googleUserData: null,

  // 🟢 Open modal (with optional role)
  openLoginModal: (role) => {
    set({ isOpen: true, role: role || null });
  },

  // 🔴 Close modal
  closeLoginModal: () => set({ isOpen: false, googleUserData: null }),

  // ✳️ Prefill Google user data (after redirect or login)
  setPrefillGoogleData: (data) => set({ googleUserData: data }),

  // 🧹 Clear Google prefill data
  clearPrefill: () => set({ googleUserData: null }),
}));
