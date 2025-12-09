'use client';

import dynamic from 'next/dynamic';

const InstallmentsPage = dynamic(() => import('@/components/Installments'), {
  ssr: false,
});

export default function Page() {
  return <InstallmentsPage />;
}
