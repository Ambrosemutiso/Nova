// types/review.ts
export interface Review {
  _id?: string;
  userId: string;
  sellerId: string;
  name: string;
  rating: number;
  comment: string;
  verified?: boolean;
  createdAt?: number;
}
