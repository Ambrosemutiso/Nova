// lib/firebaseConfig.ts

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD3kH_yW6xnLCHzsYDQVSl_BHE_w5vkrBE',
  authDomain: 'novamart-8742a.firebaseapp.com',
  projectId: 'novamart-8742a',
  storageBucket: 'novamart-8742a.appspot.com',
  messagingSenderId: '7530844007',
  appId: '1:7530844007:web:4bf3b39c0d167ac047a9c2',
  measurementId: 'G-7R42QB0RSH',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
