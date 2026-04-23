'use client';

import { useEffect, useState } from 'react';
import Hero from '@/components/Hero';
import Menu from '@/components/Menu';
import ProductsList from '@/components/ProductsList';
import TopPicksForYou from '@/components/TopPicksForYou';
import SuggestedForYou from '@/components/SuggestedForYou';
import SponsoredProducts from '@/components/SponsoredProducts';
import FlashSales from '@/components/FlashSales';
import InstallmentProducts from '@/components/InstallmentProducts';
import UsedRefurbishedProducts from '@/components/RefurbishedProducts';
import Loader from '@/components/Loader';

export default function Main() {
  const [category, setCategory] = useState('Shop');
    const [loading, setLoading] = useState(true);

      /* Hide footer during intro */
      useEffect(() => {
        if (loading) {
          document.body.classList.add('hide-footer');
        } else {
          document.body.classList.remove('hide-footer');
        }
      }, [loading]);
    
      useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 3000);
        return () => clearTimeout(timer);
      }, []);
    
      if (loading) return <Loader />;

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 space-y-6 bg-gradient-to-b from-orange-50 to-white">

      <Hero />

      <Menu onSelectCategory={setCategory} />

      <FlashSales />

      <ProductsList category={category} />

      <InstallmentProducts />

      <SponsoredProducts />
      <SuggestedForYou />

      <TopPicksForYou />

      <UsedRefurbishedProducts />

    </div>
  );
}