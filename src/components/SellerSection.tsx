'use client';

import { useEffect, useState } from 'react';
import { getSellerInfo, getSellerReviews } from '@/lib/getSellerDetails';
import { useAuth } from '@/app/context/AuthContext';
import StarRatingInput from '@/components/ReviewsInput';
import StarRatingDisplay from '@/components/StarRatingsDisplay';

export default function SellerSection({
  sellerId,
  showLoginModal,
}: {
  sellerId: string;
  showLoginModal: () => void;
}) {
  const [seller, setSeller] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchSeller = async () => {
      const info = await getSellerInfo(sellerId);
      const revs = await getSellerReviews(sellerId);
      setSeller(info);
      setReviews(revs);
      setIsFollowing(info.followers?.includes(user?.uid ?? '') ?? false);
    };

    if (sellerId) fetchSeller();
  }, [sellerId, user?.uid]);

  const handleFollow = async () => {
    if (!user) return showLoginModal();

    const res = await fetch('/api/follow-seller', {
      method: 'POST',
      body: JSON.stringify({ sellerId, userId: user.uid, action: 'follow' }),
    });

    if (res.ok) setIsFollowing(true);
  };

  const handleUnfollow = async () => {
    if (!user) return showLoginModal();

    const res = await fetch('/api/follow-seller', {
      method: 'POST',
      body: JSON.stringify({ sellerId, userId: user.uid, action: 'unfollow' }),
    });

    if (res.ok) setIsFollowing(false);
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
          {reviews.length > 0 && (
            <div className="text-sm text-yellow-500 flex items-center gap-2">
              <span>
                ⭐ {averageRating.toFixed(1)} ({reviewCount} reviews)
              </span>
            </div>
          )}
          <p className="text-gray-500">{seller.followers?.length || 0} Followers</p>
        </div>
        {isFollowing ? (
          <button
            onClick={handleUnfollow}
            className="px-4 py-1 rounded bg-gray-300 text-black"
          >
            Unfollow
          </button>
        ) : (
          <button
            onClick={handleFollow}
            className="px-4 py-1 rounded bg-orange-500 text-white"
          >
            Follow
          </button>
        )}
      </div>

      <div className="mt-4 text-sm space-y-1">
        <p><span className="font-medium">Shipping speed:</span> Excellent</p>
        <p><span className="font-medium">Quality Score:</span> Good</p>
        <p><span className="font-medium">Customer Rating:</span> Good</p>
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
          <h3 className="font-semibold">Write a Review</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              const res = await fetch('/api/reviews', {
                method: 'POST',
                body: JSON.stringify({
                  sellerId,
                  userId: user.uid,
                  name: user.displayName || 'Anonymous',
                  rating,
                  comment,
                  verified: true,
                }),
              });

              if (res.ok) {
                setComment('');
                setRating(0);
                alert('Review submitted!');
                const newReviews = await getSellerReviews(sellerId);
                setReviews(newReviews);
              } else {
                const err = await res.json();
                alert(err.error || 'Failed to submit review');
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
              Submit Review
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
