'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Category {
  name: string;
  image: string;
}

const categories: Category[] = [
  { name: 'Shop',        image: '/shop.png' },
  { name: 'Laptops',     image: '/laptop.jpg' },
  { name: 'Phones',      image: '/phone.jpg' },
  { name: 'Computers',     image: '/kitchen.jpg' },
  { name: 'Household',    image: '/kitchen1.jpg' },
  { name: 'Kitchen',       image: '/kitchen.jpg' },
  { name: 'Sofas',    image: '/TV.jpg' },
  { name: 'Health',  image: '/TV1.jpg' },
  { name: 'Beauty',image: '/kitchen.jpg' },
  { name: 'Women',    image: '/TV.jpg' },
  { name: 'Kids',      image: '/TV2.jpg' },
  { name: 'Skincare',    image: '/TV.jpg' },
  { name: 'Men',  image: '/TV1.jpg' },
  { name: 'Books',image: '/kitchen.jpg' },
  { name: 'Machines',    image: '/TV.jpg' },
  { name: 'Spares',      image: '/TV2.jpg' },
  { name: 'Motors',      image: '/TV2.jpg' }, 
  { name: 'Liquor',      image: '/TV2.jpg' },  
];
                                     
export default function CategoryMenu({
  onSelectCategory,
}: {
  onSelectCategory: (category: string) => void;
}) {
  const [selected, setSelected] = useState<string>('Shop');

  const handleClick = (cat: string) => {
    setSelected(cat);
    onSelectCategory(cat);
  };

  return (
    <div className="bg-white py-4 px-2">
      <div className="flex gap-4 overflow-x-auto px-1 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        {categories.map((cat) => {
          const isSelected = selected === cat.name;

          return (
          <button
          key={cat.name}
          onClick={() => handleClick(cat.name)}
          title={cat.name}
          className="flex-shrink-0 flex flex-col items-center focus:outline-none group"
          >

              <div
                className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                  isSelected
                    ? 'ring-4 ring-orange-500 scale-105 border-orange-500 shadow-md'
                    : 'border-gray-300 group-hover:border-orange-400'
                }`}
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>
              <span
                className={`mt-2 text-xs md:text-sm font-medium transition-colors ${
                  isSelected ? 'text-orange-600' : 'text-gray-700 group-hover:text-orange-500'
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
