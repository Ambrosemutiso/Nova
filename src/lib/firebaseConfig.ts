// lib/firebaseConfig.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD3kH_yW6xnLCHzsYDQVSl_BHE_w5vkrBE",
  authDomain: "novamart-8742a.firebaseapp.com",
  projectId: "novamart-8742a",
  storageBucket: "novamart-8742a.firebasestorage.app",
  messagingSenderId: "7530844007",
  appId: "1:7530844007:web:4bf3b39c0d167ac047a9c2",
  measurementId: "G-7R42QB0RSH"
};

// Initialize app safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Existing services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Messaging
export const messaging = async () => {
  if (typeof window === "undefined") return null;

  const supported = await isSupported();
  if (!supported) return null;

  return getMessaging(app);
};