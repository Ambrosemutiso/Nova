import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import path from 'path';
import { readFileSync } from 'fs';

if (!getApps().length) {
  const serviceAccount = JSON.parse(
    readFileSync(path.resolve(process.cwd(), 'serviceAccountKey.json'), 'utf8')
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminDb = admin.firestore();
