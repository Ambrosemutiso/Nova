'use client'

import dynamic from 'next/dynamic';

const ActiveShops = dynamic(() => import('@/components/ActiveShops'), { ssr: false });

export default function ShopListPage() {
  return <ActiveShops />;
}
