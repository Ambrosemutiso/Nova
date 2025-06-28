'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import StarRatingInput from '@/components/ReviewsInput';
import StarRatingDisplay from '@/components/StarRatingsDisplay';
import { Review } from '@/app/types/review';
import { Seller } from '@/app/types/seller';
import toast from 'react-hot-toast';

export default function SellerSection({
  sellerId,
  showLoginModal,
}: {
  sellerId: string;
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
      const sellerRes = await fetch(`/api/seller/${sellerId}`);
      const info: Seller = await sellerRes.json();

      const reviewsRes = await fetch(`/api/seller/${sellerId}/reviews`);
      const revs: Review[] = await reviewsRes.json();

      setSeller(info);
      setReviews(revs);

      if (user) {
        const userReview = revs.find((r) => r.userId === user._id);
        if (userReview) {
          setRating(userReview.rating);
          setComment(userReview.comment);
          setExistingReviewId(userReview._id ?? null);
        }

        const following = info.followers?.includes(user._id);
        setIsFollowing(following ?? false);
      }
    } catch (err) {
      console.error('Error fetching seller data:', err);
    }
  }, [sellerId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFollowAction = async (action: 'follow' | 'unfollow') => {
    if (!user) {
      toast.error(`Please log in to ${action} sellers`);
      return showLoginModal();
    }

    if (user._id === sellerId) {
      return toast.error('You cannot follow yourself.');
    }

    try {
      const res = await fetch('/api/follow-seller', {
        method: 'POST',
        body: JSON.stringify({ sellerId, userId: user._id, action }),
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

  const reviewCount = reviews.length;
  const averageRating = reviewCount
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;

  if (!seller) {
    return (
      <div className="mt-4 p-4">
        <p className="text-red-500">Seller not found or not yet registered.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 border p-4 rounded shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-lg">{seller.name} - Official Store</h2>
          {reviewCount > 0 && (
            <div className="text-sm text-yellow-500 flex items-center gap-2">
              <span>⭐ {averageRating.toFixed(1)} ({reviewCount} reviews)</span>
            </div>
          )}
          <p className="text-gray-500">{seller.followers?.length || 0} Followers</p>
        </div>

        {user && (
          <button
            onClick={() => handleFollowAction(isFollowing ? 'unfollow' : 'follow')}
            className={`px-4 py-1 rounded ${isFollowing ? 'bg-gray-300 text-black' : 'bg-orange-500 text-white'}`}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>

      <StarRatingDisplay rating={averageRating} />
      <p className="text-sm text-gray-500">{reviewCount} reviews</p>

      {reviews.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-orange-500">Top Reviews</h3>
          <div className="space-y-2 mt-2">
            {reviews.map((review, idx) => (
              <div key={idx} className="border p-2 rounded bg-gray-50">
                <div className="flex justify-between">
                  <p className="font-semibold">{review.name}</p>
                  <p className="text-yellow-500">⭐ {review.rating}/5</p>
                </div>
                <p className="text-sm">{review.comment}</p>
                {review.verified && (
                  <span className="text-green-600 text-xs font-medium">✔ Verified Purchase</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
                  sellerId,
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
                const updated = await fetch(`/api/seller/${sellerId}/reviews`).then((res) => res.json());
                setReviews(updated);
              } else {
                toast.error(data.error || 'Failed to submit review');
              }
            }}
            className="space-y-2 mt-2"
          >
            <div>
              <label className="block text-sm mb-1">Rating:</label>
              <StarRatingInput rating={rating} setRating={setRating} />
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
            <button
              type="submit"
              className="bg-orange-500 text-white px-4 py-1 rounded"
            >
              {existingReviewId ? 'Update Review' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
