// app/search/page.tsx
import { Suspense } from 'react';
import SearchResults from '@/components/SearchResults';

export default function Page() {
  return (
    <Suspense fallback={<div className="pt-24 text-center text-orange-500">Loading search...</div>}>
      <SearchResults />
    </Suspense>
  );
}
