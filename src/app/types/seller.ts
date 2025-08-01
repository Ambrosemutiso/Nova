export interface Seller {
  _id: string;
  name: string;
  email: string;
  image?: string;
  logo?: string;
  banner?: string;
  role: 'seller';
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


