// types/seller.ts
export type Follower = {
  userId: string;
  followedAt?: Date;
};

export type Seller = {
  _id: string;
  name: string;
  followers: string[]; 
  averageRating: number;
  reviewCount: number;
};
