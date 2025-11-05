import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import path from 'path';
import { readFileSync } from 'fs';

// Ensure we don’t reinitialize in dev/hot reload
if (!getApps().length) {
  const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// 🔹 Firestore instance (for any admin DB actions)
export const adminDb = admin.firestore();

// 🔹 Firebase Admin Auth (for ID token verification)
export const adminAuth = admin.auth();

// 🔹 Default export (optional — makes importing cleaner)
export default admin;
