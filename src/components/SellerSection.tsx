'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import StarRatingInput from '@/components/ReviewsInput';
import { toast, ToastContainer } from 'react-toastify';
import { ShieldCheck, ChevronRight, CheckCircle } from 'lucide-react';
import { Seller } from '@/app/types/seller';
import { Review } from '@/app/types/review';
import { Product } from '@/app/types/product';
import { useRouter } from 'next/navigation';

export default function ProductReviewSection({
  product,
  showLoginModal,
}: {
  product: Product;
  showLoginModal: () => void;
}) {
  const router = useRouter();
  const { user } = useAuth();

  const [seller, setSeller] = useState<Seller | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const sellerRes = await fetch(`/api/seller/${product.sellerId}`);
      const sellerData = await sellerRes.json();
      setSeller(sellerData);

      const res = await fetch(`/api/reviews?productId=${product._id}`);
      const { data } = await res.json();
      const fetchedReviews: Review[] = data.reviews;
      setReviews(fetchedReviews);

      if (user) {
        const userReview = fetchedReviews.find((r) => r.userId?._id === user._id);
        if (userReview) {
          setRating(userReview.rating);
          setComment(userReview.comment);
          setExistingReviewId(userReview._id ?? null);
        }
        const isUserFollowing = sellerData.followers?.some(
          (f: { userId: string }) => f.userId === user._id
        );
        setIsFollowing(isUserFollowing);
      }
    } catch (err) {
      console.error('Error fetching review data:', err);
    }
  }, [product._id, product.sellerId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);

  const ratingCounts = [5, 4, 3, 2, 1].map(
    (star) => reviews.filter((r) => r.rating === star).length
  );

  const handleFollowAction = async (action: 'Follow' | 'Unfollow') => {
    if (!user) {
      toast.error(`Please log in to ${action.toLowerCase()} sellers`);
      return showLoginModal();
    }

    if (user._id === product.sellerId) {
      return toast.error('You cannot follow yourself.');
    }

    try {
      const res = await fetch('/api/follow-seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: product.sellerId,
          userId: user._id,
          action,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || `${action}ed seller`);
        setIsFollowing(action === 'Follow');
        fetchData();
      } else {
        toast.error(data.message || `Failed to ${action.toLowerCase()}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred.');
    }
  };

  return (
    <div className="mt-8 border rounded-lg bg-white shadow-sm overflow-hidden">
      <ToastContainer />

      {/* Verified Ratings Summary */}
      <div className="border-b bg-gray-50 px-4 py-3 font-semibold text-gray-700 text-sm uppercase">
        Verified Ratings ({reviews.length})
      </div>

      {/* Ratings Overview */}
      <div className="flex flex-col md:flex-row gap-4 p-4 border-b">
        {/* Average Rating */}
        <div className="flex flex-col items-center justify-center w-full md:w-1/3 bg-white rounded-md">
          <p className="text-3xl font-bold text-yellow-500">
            {averageRating.toFixed(1)}/5
          </p>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.round(averageRating) ? 'text-yellow-500' : 'text-gray-300'}>
                ★
              </span>
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {reviews.length} verified rating{reviews.length !== 1 && 's'}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 flex flex-col justify-center gap-1">
          {[5, 4, 3, 2, 1].map((star, i) => {
            const count = ratingCounts[5 - star];
            const percentage = reviews.length ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-6">{star}</span>
                <span className="text-yellow-500">★</span>
                <div className="h-2 bg-gray-200 rounded-full flex-1">
                  <div
                    className="h-2 bg-yellow-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 w-6 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Reviews */}
      <div className="bg-gray-50 px-4 py-3 font-semibold text-gray-700 text-sm uppercase">
        Product Reviews ({reviews.length})
      </div>

      {reviews.length > 0 ? (
        <div className="p-4 space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white border rounded-lg shadow-sm p-4 text-sm"
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex text-yellow-500">
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </div>
                <span className="text-gray-400 text-xs">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="font-semibold text-gray-800 capitalize">
                {review.comment?.split(' ')[0] || 'Review'}
              </p>
              <p className="text-gray-600 mt-1 text-sm">{review.comment}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-gray-500 text-xs">
                  by {review.userId?.name || 'Anonymous'}
                </p>
                {review.verified && (
                  <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                    <CheckCircle size={14} /> Verified Purchase
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="p-4 text-gray-500 text-sm text-center">
          No reviews yet. Be the first to review this product!
        </p>
      )}

      {/* Add or Update Review */}
      {user && (
        <div className="mt-2 border-t px-4 py-4">
          <h3 className="font-semibold text-orange-500 text-sm mb-2">
            {existingReviewId ? 'Update Your Review' : 'Write a Review'}
          </h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  productId: product._id,
                  userId: user._id,
                  name: user.name || 'Anonymous',
                  rating,
                  comment,
                  verified: true,
                }),
              });

              const data = await res.json();

              if (res.ok) {
                toast.success(existingReviewId ? 'Review updated!' : 'Review submitted!');
                setComment('');
                setRating(0);
                setExistingReviewId(null);
                fetchData();
              } else {
                toast.error(data.error || 'Failed to submit review');
              }
            }}
            className="space-y-2"
          >
            <div>
              <label className="block text-sm mb-1">Rating:</label>
              <StarRatingInput value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="block text-sm mb-1">Comment:</label>
              <textarea
                className="w-full border rounded p-2 text-sm"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-orange-500 text-white px-4 py-2 rounded text-sm hover:bg-orange-600"
            >
              {existingReviewId ? 'Update Review' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Seller Info Section */}
      {seller && (
        <div
          onClick={() => router.push(`/seller/${seller._id}`)}
          className="mt-4 border-t px-4 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-all duration-200"
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-700">
                {seller.name || 'Unknown Seller'} - Official Store
              </p>
              {seller.followers?.length ? (
                <ShieldCheck className="w-4 h-4 text-orange-600" />
              ) : null}
            </div>
            <p className="text-xs text-gray-500">
              {seller.followers?.length || 0} Followers
            </p>
          </div>

          {/* Follow Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFollowAction(isFollowing ? 'Unfollow' : 'Follow');
              }}
              className={`px-3 py-1 text-sm rounded border transition-all ${
                isFollowing
                  ? 'bg-orange-100 border-orange-400 text-orange-600'
                  : 'bg-orange-500 border-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      )}
    </div>
  );
}
