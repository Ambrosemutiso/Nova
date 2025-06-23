// lib/firebaseAdmin.ts
import admin from 'firebase-admin';
import serviceAccount from '@/serviceAccountKey.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

const adminDb = admin.firestore();

export { admin, adminDb };
