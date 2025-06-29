// app/search/page.tsx
'use client';

import dynamic from 'next/dynamic';

const WishlistPage = dynamic(() => import('@/components/WishlistPage'), {
  ssr: false,
});

export default function Page() {
  return <WishlistPage />;
}
