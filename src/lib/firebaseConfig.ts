// lib/firebaseConfig.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

// 🔥 Your existing config (UNCHANGED)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECTID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSANGINGID,
  appId: process.env.FIREBASE_APPID,
  measurementId: process.env.FIREBASE_MEASUREMENTID,
};

// ✅ Initialize app safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Existing services (unchanged)
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ Messaging (SAFE for SSR)
export const messaging = async () => {
  if (typeof window === "undefined") return null;

  const supported = await isSupported();
  if (!supported) return null;

  return getMessaging(app);
};