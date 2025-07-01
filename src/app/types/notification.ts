export interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
  role: 'buyer' | 'seller';
  recipient: string; // or full user object if populated
}

