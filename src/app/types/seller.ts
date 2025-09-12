export interface Seller {
  _id: string;
  name: string;
  email: string;
  image?: string;
  logo?: string;
  banner?: string;
  role: 'seller';
  country: string;
  currency: string;
  phoneNumber: string;
  shopName?: string;
  isVerified: boolean;
  followers: {
    userId: string;
    followedAt?: Date;
  }[];
  shop: {
    isActive: boolean;
    activatedAt?: Date;
    expiresAt?: Date;
    amountPaid?: number;
    transactionId?: string;
  };
  createdAt: Date;
}


