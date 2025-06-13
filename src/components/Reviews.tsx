'use client';

import { useEffect, useState } from 'react';

type Review = {
  _id: string;
  userName: string;
  comment: string;
  rating: number;
  createdAt: string;
};

const ReviewSection = ({ id }: { id: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewUser, setReviewUser] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/review/${id}`);
        const data = await res.json();
        setReviews(data.reviews);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      }
    };

    fetchReviews();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/review/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: reviewUser,
          comment: reviewComment,
          rating: reviewRating,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit review');

      const data = await res.json();
      setReviews([data.review, ...reviews]);
      setReviewUser('');
      setReviewComment('');
      setReviewRating(5);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 border rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Your Name"
          value={reviewUser}
          onChange={(e) => setReviewUser(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          placeholder="Your Review"
          value={reviewComment}
          onChange={(e) => setReviewComment(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <select
          value={reviewRating}
          onChange={(e) => setReviewRating(Number(e.target.value))}
          className="w-full p-2 border rounded"
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} Star{r > 1 && 's'}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>

      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul className="space-y-4">
{reviews.map((review) => (
  <li key={review._id} className="p-3 border rounded">
    <p className="font-semibold">{review.userName}</p>
    <p className="text-yellow-500">Rating: {review.rating} ★</p>
    <p>{review.comment}</p>
    <p className="text-sm text-gray-500">
      {new Date(review.createdAt).toLocaleString()}
    </p>
  </li>
))}

        </ul>
      )}
    </div>
  );
};

export default ReviewSection;
