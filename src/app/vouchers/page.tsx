'use client';

import dynamic from 'next/dynamic';

const MyVouchersPage = dynamic(() => import('@/components/Vouchers'), {
  ssr: false,
});

export default function Page() {
  return <MyVouchersPage />;
}
