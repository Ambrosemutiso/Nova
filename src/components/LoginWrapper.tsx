'use client';

import { useState } from 'react';
import LoginModal from '@/components/Login';
import Footer from '@/components/Footer';

export default function LoginWrapper() {
  const [showLogin, setShowLogin] = useState(false);
  const [loginRole, setLoginRole] = useState<'buyer' | 'seller' | null>(null);

  return (
    <>
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          defaultRole={loginRole}
        />
      )}
      <Footer
        onOpenSellerLogin={() => {
          setLoginRole('seller');
          setShowLogin(true);
        }}
      />
    </>
  );
}
