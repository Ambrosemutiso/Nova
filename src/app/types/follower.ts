export interface Follower {
  userId: {
    _id: string;
    name?: string;
  };
  followedAt?: string;
}
