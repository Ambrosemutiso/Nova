export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: 'buyer' | 'seller';
  shopName?: string; // for sellers only
}
