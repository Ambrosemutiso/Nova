'use client';

import { useState } from 'react';
import SellerLoginModal from '@/components/modals/SellerLoginModal';
import BuyerLoginModal from '@/components/modals/BuyerLoginModal';
import Footer from '@/components/Footer';
import Navbar from './Navbar';

export default function LoginWrapper() {
  const [activeModal, setActiveModal] = useState<'buyer' | 'seller' | null>(null);

  const openSellerLogin = () => setActiveModal('seller');
  const openBuyerLogin = () => setActiveModal('buyer');
  const closeModal = () => setActiveModal(null);

  return (
    <>
      {activeModal === 'seller' && <SellerLoginModal onClose={closeModal} />}
      {activeModal === 'buyer' && <BuyerLoginModal onClose={closeModal} />}

      {/* Footer still opens modals via props */}
      <Navbar onOpenBuyerLogin={openBuyerLogin}/>
      <Footer onOpenSellerLogin={openSellerLogin} />
    </>
  );
}
