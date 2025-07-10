export interface Review {
  _id: string;
  productId: string;
  userId: {
    _id: string;
    name: string;
    image: string;
  };
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: string;
}
