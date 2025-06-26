// src/app/types/User.ts
export interface AppUser {
  _id: string;          
  name: string;
  email: string;
  photoURL?: string;    
  role: 'buyer' | 'seller';
}
