// app/search/page.tsx
'use client';

import dynamic from 'next/dynamic';

const SearchResults = dynamic(() => import('@/components/SearchResults'), {
  ssr: false,
});

export default function Page() {
  return <SearchResults />;
}
