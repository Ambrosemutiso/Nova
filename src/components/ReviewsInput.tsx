'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
}

function getRatingLabel(value: number): string {
  if (value === 0) return 'Not rated';
  if (value <= 1) return 'Very Poor';
  if (value <= 2) return 'Poor';
  if (value <= 3) return 'Average';
  if (value <= 4) return 'Good';
  return 'Excellent';
}

export default function StarRatingInput({ value, onChange }: StarRatingInputProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const displayRating = hovered ?? value;

  const handleClick = (index: number, isHalf: boolean) => {
    const selected = isHalf ? index + 0.5 : index + 1;

    // Toggle to clear rating if same value clicked
    if (selected === value) {
      onChange(0);
    } else {
      onChange(selected);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        {[0, 1, 2, 3, 4].map((index) => {
          const isFull = index + 1 <= displayRating;
          const isHalf = !isFull && index + 0.5 <= displayRating;

          return (
            <motion.div
              key={index}
              className="relative text-yellow-400 cursor-pointer"
              onMouseLeave={() => setHovered(null)}
            >
              {/* Left half (0.5) */}
              <div
                className="absolute left-0 top-0 w-1/2 h-full z-10"
                onMouseEnter={() => setHovered(index + 0.5)}
                onClick={() => handleClick(index, true)}
              />
              {/* Right half (1.0) */}
              <div
                className="absolute right-0 top-0 w-1/2 h-full z-10"
                onMouseEnter={() => setHovered(index + 1)}
                onClick={() => handleClick(index, false)}
              />
              {/* Star display */}
              <motion.div animate={{ scale: hovered ? 1.2 : 1 }} transition={{ duration: 0.2 }}>
                {isFull ? (
                  <FaStar size={24} />
                ) : isHalf ? (
                  <FaStarHalfAlt size={24} />
                ) : (
                  <FaRegStar size={24} />
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
      <p className="text-sm text-gray-500">{getRatingLabel(displayRating)}</p>
    </div>
  );
}
