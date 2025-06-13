'use client';

import { useState } from 'react';
import Hero from '@/components/Hero';
import Menu from '@/components/Menu';
import ProductsList from '@/components/ProductsList';

export default function Main() {
  const [category, setCategory] = useState('Shop');
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Menu onSelectCategory={setCategory}/>
      <ProductsList category={category} />
    </div>
  );
}
