'use client';
import { useEffect } from 'react';
import { Product } from '@/app/types/product';

type Props = { product: Product };

export default function BehaviorTracker({ product }: Props) {
  useEffect(() => {
    const id = product._id;

    // Save to recent views
    let recent = JSON.parse(localStorage.getItem('recentViews') || '[]');
    recent = recent.filter((item: string) => item !== id); // remove if exists
    recent.unshift(id); // add to start
    if (recent.length > 10) recent.pop(); // limit to 10
    localStorage.setItem('recentViews', JSON.stringify(recent));

    // Update view frequency
    const counts = JSON.parse(localStorage.getItem('viewCounts') || '{}');
    counts[id] = (counts[id] || 0) + 1;
    localStorage.setItem('viewCounts', JSON.stringify(counts));
  }, [product]);

  return null;
}
