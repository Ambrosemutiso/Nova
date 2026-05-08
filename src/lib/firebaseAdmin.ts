// lib/firebaseAdmin.ts

import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
import path from "path";
import { readFileSync } from "fs";

function initializeFirebaseAdmin() {
  if (getApps().length) return;

  try {
    // OPTION 1: Use serviceAccountKey.json (current setup)
    const serviceAccountPath = path.resolve(process.cwd(), "serviceAccountKey.json");
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    // OPTION 2: Fallback to environment variables
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECTID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
}

// 🔥 Initialize once
initializeFirebaseAdmin();

// ✅ Services (ALL preserved + messaging added)
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminMessaging = admin.messaging(); // ⭐ NEW

export default admin;