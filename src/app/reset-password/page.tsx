'use client'

import dynamic from 'next/dynamic';

const ResetPasswordPage = dynamic(() => import('@/components/PasswordReset'), { ssr: false });

export default function ShopListPage() {
  return <ResetPasswordPage />;
}
