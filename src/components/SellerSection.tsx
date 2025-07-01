'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import StarRatingInput from '@/components/ReviewsInput';
import StarRatingDisplay from '@/components/StarRatingsDisplay';
import { Review } from '@/app/types/review';
import { Seller } from '@/app/types/seller';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

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
      setSeller(info);

      const res = await fetch(`/api/reviews?sellerId=${sellerId}`);
      const { data } = await res.json();
      const fetchedReviews: Review[] = data.reviews;
      setReviews(fetchedReviews);

      if (user) {
        const userReview = fetchedReviews.find((r) => r.userId._id === user._id);
        if (userReview) {
          setRating(userReview.rating);
          setComment(userReview.comment);
          setExistingReviewId(userReview._id ?? null);
        }

        const isUserFollowing = info.followers?.some((f) => f.userId === user._id);
        setIsFollowing(isUserFollowing);
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
        headers: { 'Content-Type': 'application/json' },
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

  if (!seller) {
    return (
      <div className="mt-4 p-4">
        <p className="text-red-500">Seller not found or not yet registered.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 border p-4 rounded shadow-sm relative">
<div className="relative mt-4 border p-4 rounded shadow-sm overflow-hidden z-0">
  {seller.followers?.length >= 1 && (
    <span className="absolute top-2 right-2 bg-yellow-400 text-black text-xs px-3 py-1 rounded-full shadow font-semibold z-10 flex items-center gap-1">
      <ShieldCheck size={14} className="text-green-700" />
      Verified Seller
    </span>
  )}
</div>



      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg">{seller.name} - Official Store</h2>
          </div>
          {seller.reviewCount > 0 && (
            <div className="text-sm text-yellow-500 flex items-center gap-2">
              <span>
                ⭐ {seller.averageRating.toFixed(1)} ({seller.reviewCount} reviews)
              </span>
            </div>
          )}
          <p className="text-gray-500">{seller.followers?.length || 0} Followers</p>
        </div>

        {user && (
          <button
            onClick={() => handleFollowAction(isFollowing ? 'unfollow' : 'follow')}
            className={`px-4 py-1 rounded ${
              isFollowing ? 'bg-gray-300 text-black' : 'bg-orange-500 text-white'
            }`}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>

      <StarRatingDisplay rating={seller.averageRating} />
      <p className="text-sm text-gray-500">({seller.reviewCount} reviews)</p>

      {reviews.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-orange-500">Top Reviews</h3>
          <div className="space-y-2 mt-2">
            {reviews.map((review) => (
              <div key={review._id} className="border p-2 rounded bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <Image
                    src={review.userId?.image || '/avatar.png'}
                    alt={review.userId?.name}
                    width={30}
                    height={30}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{review.userId?.name}</p>
                    <p className="text-yellow-500 text-sm">⭐ {review.rating}/5</p>
                  </div>
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
    </div>
  );
}
