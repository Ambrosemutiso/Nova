'use client';

import { FaStar } from 'react-icons/fa';

export default function StarRatingInput({ rating, setRating }: {
  rating: number;
  setRating: (val: number) => void;
}) {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`cursor-pointer ${
            rating >= star ? 'text-yellow-400' : 'text-gray-300'
          }`}
          onClick={() => setRating(star)}
          size={24}
        />
      ))}
    </div>
  );
}
