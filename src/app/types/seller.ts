export interface Seller {
  _id: string;
  name: string;
  email: string;
  image: string;
  shopName?: string;
  role: 'seller';
  followers: {
    userId: string;
    followedAt: string;
  }[];
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

