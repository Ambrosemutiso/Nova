'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import StarRatingInput from '@/components/ReviewsInput';
import { toast, ToastContainer } from 'react-toastify';
import { ShieldCheck } from 'lucide-react';
import { Seller } from '@/app/types/seller';
import { Review } from '@/app/types/review';
import { Product } from '@/app/types/product';

export default function ProductReviewSection({
  product,
  showLoginModal,
}: {
  product: Product;
  showLoginModal: () => void;
}) {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user } = useAuth();

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

  const handleFollowAction = async (action: 'follow' | 'unfollow') => {
    if (!user) {
      toast.error(`Please log in to ${action} sellers`);
      return showLoginModal();
    }

    if (user._id === product.sellerId) {
      return toast.error('You cannot follow yourself.');
    }

    try {
      const res = await fetch('/api/follow-seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId: product.sellerId, userId: user._id, action }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || `${action}ed seller`);
        setIsFollowing(action === 'follow');
        fetchData();
      } else {
        toast.error(data.message || `Failed to ${action}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred.');
    }
  };

  return (
    <div className="mt-8 border p-4 rounded shadow-sm">
      <ToastContainer/>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">Product Rating & Reviews</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-yellow-600 font-semibold text-lg">
            {averageRating.toFixed(1)}/5
          </span>
          <span className="text-gray-600 text-sm">
            {reviews.length} verified rating{reviews.length !== 1 && 's'}
          </span>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-gray-50 border rounded p-3 shadow-sm text-sm"
            >
              <div className="flex justify-between items-center mb-1">
                <p className="text-yellow-500 font-medium text-sm">
                  {'★'.repeat(review.rating)}{' '}
                  {'☆'.repeat(5 - review.rating)}
                </p>
                <span className="text-gray-400 text-xs">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="font-semibold">{review.comment}</p>
              <p className="text-gray-600 mt-1 text-xs">
                by {review.userId?.name || 'Anonymous'}
              </p>
              {review.verified && (
                <span className="text-green-600 text-xs font-semibold">
                  ✔ Verified Purchase
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Update Review */}
      {user && (
        <div className="mt-6 border-t pt-4">
          <h3 className="font-semibold text-orange-500">
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
            className="space-y-2 mt-2"
          >
            <div>
              <label className="block text-sm mb-1">Rating:</label>
              <StarRatingInput value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="block text-sm mb-1">Comment:</label>
              <textarea
                className="w-full border rounded p-2"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-orange-500 text-white px-4 py-1 rounded">
              {existingReviewId ? 'Update Review' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Seller Footer */}
      {seller && (
        <div className="mt-8 border-t pt-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm font-semibold text-gray-700">
                {seller.name || 'Unknown Seller'} - Official Store
              </p>
              {(seller.followers?.length ?? 0) > 0 && (
                <span title="Verified Seller">
                  <ShieldCheck className="w-4 h-4 text-orange-600" />
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {seller.followers?.length || 0} Followers
            </p>
          </div>

          {user && (
            <button
              onClick={() => handleFollowAction(isFollowing ? 'unfollow' : 'follow')}
              className={`px-4 py-1 rounded text-sm ${
                isFollowing ? 'bg-gray-300 text-black' : 'bg-orange-500 text-white'
              }`}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
