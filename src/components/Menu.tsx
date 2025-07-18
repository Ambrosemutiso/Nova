'use client';

import { useState } from 'react';
import Image from 'next/image';
import Kids from './categories/Kids/page';
import Skincare from './categories/Skincare/page';
import Books from './categories/Books/page';
import Machines from './categories/Machines/page';

interface Category {
  name: string;
  image: string;
}

const categories: Category[] = [
  { name: 'Shop',        image: '/shop.png' },
  { name: 'Laptops',     image: '/Menu/Laptops.jpg' },
  { name: 'Electronics',     image: '/Menu/Electronics.jpg' },
  { name: 'Phones',      image: '/Menu/Phones.jpg' },
  { name: 'Computers',     image: '/Menu/Computers.jpg' },
  { name: 'Systems',     image: '/Menu/Systems.jpg' },
  { name: 'Household',    image: '/Menu/Household.jpg' },
  { name: 'Kitchen',       image: '/Menu/Kitchen1.jpg' },
  { name: 'Sofas',    image: '/Menu/Sofas.jpg' },
  { name: 'Health',  image: '/Menu/Health.jpg' },
  { name: 'Beauty',image: '/Menu/Beauty.jpg' },
  { name: 'Women',    image: '/Menu/Women.jpg' },
  { name: 'Kids',      image: '/Menu/Kids.jpg' },
  { name: 'Skincare',    image: '/Menu/Skincare.jpg' },
  { name: 'Men',  image: '/Menu/Men.jpg' },
  { name: 'Books',image: '/Menu/Books.jpg' },
  { name: 'Machines',    image: '/Menu/Machines.jpg' },
  { name: 'Spares',      image: '/Menu/Spares.jpg' },
  { name: 'Motors',      image: '/Menu/Motors.jpg' }, 
  { name: 'Liquor',      image: '/Menu/Liquor.jpg' },
  { name: 'Robotics',      image: '/Menu/Robotics.jpg' },
  { name: 'Sports',      image: '/Menu/Sports.jpg' },
  { name: 'Gaming',      image: '/Menu/Gaming.jpg' },  
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
