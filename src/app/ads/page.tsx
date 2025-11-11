'use client';

import dynamic from 'next/dynamic';

const AdsFeedPage = dynamic(() => import('@/components/Ads'), {
  ssr: false,
});

export default function Page() {
  return <AdsFeedPage />;
}
