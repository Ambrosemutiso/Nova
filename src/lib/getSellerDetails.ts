import { dbConnect } from '@/lib/dbConnect';
import Seller from '@/app/models/seller';
import Review from '@/app/models/review';
import { Seller as SellerType, Follower } from '@/app/types/seller';
import { Review as ReviewType } from '@/app/types/review';
import { Types } from 'mongoose';

// Define the structure of a follower object
interface SellerDoc {
  _id: Types.ObjectId;
  name: string;
  followers?: Follower[] | string[];
}

// Define the structure of a review document returned by Mongoose
interface ReviewDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  sellerId: Types.ObjectId;
  name?: string;
  rating: number;
  comment: string;
  verified?: boolean;
  createdAt?: Date | number;
}

export const getSellerInfo = async (sellerId: string): Promise<SellerType> => {
  try {
    await dbConnect();

    const sellerDoc = await Seller.findById(sellerId).lean<SellerDoc>();

    if (!sellerDoc) {
      throw new Error('Seller not found');
    }

    const followers = Array.isArray(sellerDoc.followers)
      ? sellerDoc.followers.map((f) =>
          typeof f === 'object' && 'userId' in f ? f.userId.toString() : f.toString()
        )
      : [];

    const allReviews = await Review.find({ sellerId }).lean<ReviewDoc[]>();

    const reviewCount = allReviews.length;
    const averageRating =
      reviewCount > 0
        ? allReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviewCount
        : 0;

    return {
      _id: sellerDoc._id.toString(),
      name: sellerDoc.name || 'Unknown Seller',
      followers,
      averageRating,
      reviewCount,
    };
  } catch (err) {
    console.error('Error fetching seller info:', err);
    return {
      _id: '',
      name: '',
      followers: [],
      averageRating: 0,
      reviewCount: 0,
    };
  }
};

export const getSellerReviews = async (sellerId: string): Promise<ReviewType[]> => {
  try {
    await dbConnect();

    const reviews = await Review.find({ sellerId, rating: { $gte: 4 } })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean<ReviewDoc[]>();

    return reviews.map((r) => ({
      _id: r._id.toString(),
      userId: r.userId?.toString?.() || '',
      sellerId: r.sellerId?.toString?.() || '',
      name: r.name || 'Anonymous',
      rating: r.rating,
      comment: r.comment,
      verified: r.verified ?? false,
      createdAt:
        r.createdAt instanceof Date
          ? r.createdAt.getTime()
          : typeof r.createdAt === 'number'
          ? r.createdAt
          : Date.now(),
    }));
  } catch (err) {
    console.error('Error fetching seller reviews:', err);
    return [];
  }
};
