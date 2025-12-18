'use client';

import dynamic from 'next/dynamic';

const WalletPage = dynamic(() => import('@/components/Wallet'), {
  ssr: false,
});

export default function Page() {
  return <WalletPage />;
}
