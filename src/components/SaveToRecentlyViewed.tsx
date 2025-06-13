// components/SaveToRecentlyViewed.tsx
'use client';

import { useEffect } from 'react';

export default function SaveToRecentlyViewed({ id }: { id: string }) {
  useEffect(() => {
    if (!id) return;

    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const updated = [id, ...viewed.filter((v: string) => v !== id)].slice(0, 10); // keep max 10 items
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  }, [id]);

  return null;
}
