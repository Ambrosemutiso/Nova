'use client';

import { useState } from 'react';
import Hero from '@/components/Hero';
import Menu from '@/components/Menu';
import ProductsList from '@/components/ProductsList';
import TopPicksForYou from '@/components/TopPicksForYou';
import SuggestedForYou from '@/components/SuggestedForYou';
import SponsoredProducts from '@/components/SponsoredProducts';
import FlashSales from '@/components/FlashSales';
import InstallmentProducts from '@/components/InstallmentProducts'
import UsedRefurbishedProducts from '@/components/RefurbishedProducts';

export default function Main() {
  const [category, setCategory] = useState('Shop');
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Hero />
      <Menu onSelectCategory={setCategory}/>
      <FlashSales/>
      <ProductsList category={category} />
      <InstallmentProducts />
      <SponsoredProducts/>
      <SuggestedForYou/>
      <TopPicksForYou/>
      <UsedRefurbishedProducts/>
    </div>
  );
}
