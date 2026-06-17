'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import StarRatingInput from '@/components/ReviewsInput';
import { toast, ToastContainer } from 'react-toastify';
import {
  ShieldCheck, ChevronRight, CheckCircle, Star,
  Truck, Package, Award, Users, MessageSquare,
  TrendingUp, BadgeCheck,
} from 'lucide-react';
import { Seller } from '@/app/types/seller';
import { Review } from '@/app/types/review';
import type { ProductType } from '@/app/types/product';
import { useRouter } from 'next/navigation';

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= Math.round(rating) ? 'text-orange-400 fill-orange-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

function PerformanceRow({
  icon, label, value,
}: { icon: React.ReactNode; label: string; value: string }) {
  const tone =
    value === 'Excellent' ? 'text-orange-600 bg-orange-50 border-orange-100' :
    value === 'Good'      ? 'text-gray-700 bg-gray-50 border-gray-100' :
    value === 'Average'   ? 'text-gray-600 bg-gray-50 border-gray-100' :
    'text-gray-500 bg-gray-50 border-gray-100';

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${tone}`}>
        {value}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function ProductReviewSection({
  product,
  showLoginModal,
}: {
  product: ProductType;
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const sellerRes  = await fetch(`/api/seller/${product.sellerId}`);
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
    } finally {
      setLoading(false);
    }
  }, [product._id, product.sellerId, user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);
  const ratingCounts   = [5, 4, 3, 2, 1].map((star) => reviews.filter((r) => r.rating === star).length);
  const verifiedCount  = reviews.filter((r) => r.verified).length;

  const getPerformanceLabel = (value: number) => {
    if (value >= 4.5) return 'Excellent';
    if (value >= 3.5) return 'Good';
    if (value >= 2.5) return 'Average';
    if (value > 0) return 'Poor';
    return 'No Data';
  };

  const getSellerScore = () => {
    const baseScore     = 80;
    const ratingImpact   = averageRating * 4;
    const verifiedImpact = Math.min(verifiedCount * 0.5, 10);
    return Math.min(100, baseScore + ratingImpact + verifiedImpact);
  };

  const sellerScore          = getSellerScore();
  const shippingPerformance  = getPerformanceLabel(averageRating + 0.3);
  const qualityPerformance   = getPerformanceLabel(averageRating);
  const customerPerformance  = getPerformanceLabel(averageRating - 0.3);

  const handleFollowAction = async (action: 'follow' | 'unfollow') => {
    if (!user) {
      toast.error(`Please log in to ${action} sellers`);
      return showLoginModal();
    }
    if (user._id === product.sellerId) return toast.error('You cannot follow yourself.');

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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id, userId: user!._id,
          name: user!.name || 'Anonymous', rating, comment, verified: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(existingReviewId ? 'Review updated!' : 'Review submitted!');
        setComment(''); setRating(0); setExistingReviewId(null);
        fetchData();
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  /* ── skeleton ── */
  if (loading) return (
    <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 space-y-4">
        <div className="h-5 w-40 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="mt-8 space-y-4">
      <ToastContainer />

      {/* ══════════════ RATINGS SUMMARY CARD ══════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-orange-500" />
            Verified Ratings
          </h2>
          <span className="text-xs text-gray-400">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 p-5">
          {/* score block */}
          <div className="flex flex-col items-center justify-center sm:w-44 shrink-0">
            <p className="text-4xl font-black text-gray-900 leading-none">{averageRating.toFixed(1)}</p>
            <div className="mt-1.5"><StarRow rating={averageRating} size={16} /></div>
            <p className="text-xs text-gray-400 mt-2">
              {reviews.length} verified rating{reviews.length !== 1 ? 's' : ''}
            </p>
            {verifiedCount > 0 && (
              <div className="flex items-center gap-1 mt-2 bg-orange-50 px-2.5 py-1 rounded-full">
                <CheckCircle className="w-3 h-3 text-orange-500" />
                <span className="text-[10px] font-semibold text-orange-700">{verifiedCount} verified purchases</span>
              </div>
            )}
          </div>

          {/* distribution bars */}
          <div className="flex-1 flex flex-col justify-center gap-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[5 - star];
              const pct   = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2.5">
                  <span className="text-xs text-gray-500 w-3">{star}</span>
                  <Star className="w-3 h-3 text-orange-400 fill-orange-400 shrink-0" />
                  <div className="h-1.5 bg-gray-100 rounded-full flex-1 overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 w-6 text-right tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════════ REVIEWS LIST CARD ══════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-orange-500" />
            Customer Reviews ({reviews.length})
          </h2>
        </div>

        {reviews.length > 0 ? (
          <>
            <div className="divide-y divide-gray-50">
              {visibleReviews.map((review) => (
                <div key={review._id} className="px-5 py-4">
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <StarRow rating={review.rating} size={13} />
                    <span className="text-[11px] text-gray-400 shrink-0">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                  <div className="flex items-center justify-between mt-2.5">
                    <p className="text-xs text-gray-500">by {review.userId?.name || 'Anonymous'}</p>
                    {review.verified && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-orange-600">
                        <CheckCircle size={12} /> Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {reviews.length > 3 && (
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="w-full text-center text-xs font-bold text-orange-600 hover:bg-orange-50
                  py-3 transition-colors border-t border-gray-50"
              >
                {showAllReviews ? 'Show fewer reviews' : `Show all ${reviews.length} reviews`}
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center py-10 text-center px-5">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-3">
              <Star className="w-6 h-6 text-orange-300" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No reviews yet</p>
            <p className="text-xs text-gray-400 mt-1">Be the first to review this product!</p>
          </div>
        )}
      </div>

      {/* ══════════════ WRITE REVIEW CARD ══════════════ */}
      {user && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">
              {existingReviewId ? 'Update Your Review' : 'Write a Review'}
            </h3>
          </div>
          <form onSubmit={handleSubmitReview} className="px-5 py-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-2">Your Rating</label>
              <StarRatingInput value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-2">Your Review</label>
              <textarea
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm resize-none
                  focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                rows={3}
                placeholder="Share your experience with this product…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-bold
                px-5 py-2.5 rounded-xl transition active:scale-[0.98] shadow-sm shadow-orange-200"
            >
              {submitting ? 'Submitting…' : existingReviewId ? 'Update Review' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* ══════════════ SELLER CARD ══════════════ */}
      {seller && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* seller header */}
          <div
            onClick={() => router.push(`/seller/${seller._id}`)}
            className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-gray-900">{seller.name || 'Unknown Seller'}</p>
                  <BadgeCheck className="w-3.5 h-3.5 text-orange-500" />
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Users className="w-3 h-3" /> {seller.followers?.length || 0} followers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollowAction(isFollowing ? 'unfollow' : 'follow');
                }}
                className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all duration-200 active:scale-95
                  ${isFollowing
                    ? 'bg-orange-50 border-orange-200 text-orange-600'
                    : 'bg-orange-500 border-orange-500 text-white hover:bg-orange-600 shadow-sm shadow-orange-200'
                  }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
          </div>

          {/* seller score */}
          <div className="border-t border-gray-100 px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-orange-500" /> Seller Performance
              </p>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-sm font-black text-gray-900">{sellerScore.toFixed(0)}%</span>
              </div>
            </div>

            {/* score bar */}
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-700"
                style={{ width: `${sellerScore}%` }}
              />
            </div>

            <div className="space-y-3">
              <PerformanceRow icon={<Truck className="w-4 h-4 text-gray-500" />} label="Shipping speed" value={shippingPerformance} />
              <PerformanceRow icon={<Package className="w-4 h-4 text-gray-500" />} label="Quality score" value={qualityPerformance} />
              <PerformanceRow icon={<Star className="w-4 h-4 text-gray-500" />} label="Customer rating" value={customerPerformance} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}