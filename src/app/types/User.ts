export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: 'buyer' | 'seller';
  country: string;
  currency: string;
  phoneNumber: string;
}
