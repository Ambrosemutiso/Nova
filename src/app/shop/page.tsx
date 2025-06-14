'use client';

import { useState } from 'react';
import Hero from '@/components/Hero';
import Menu from '@/components/Menu';
import ProductsList from '@/components/ProductsList';
import TopPicksForYou from '@/components/TopPicksForYou';
import SuggestedForYou from '@/components/SuggestedForYou';

export default function Main() {
  const [category, setCategory] = useState('Shop');
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Menu onSelectCategory={setCategory}/>
      <ProductsList category={category} />
      <SuggestedForYou/>
      <TopPicksForYou/>
    </div>
  );
}
