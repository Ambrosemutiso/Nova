'use client';

import { useState } from 'react';
import { categoryTree } from '@/lib/productCategories';
import { slugify } from '@/lib/slugify';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { categoryImages } from "@/lib/categoryImages";

type MenuProps = {
  onSelectCategory?: (category: string) => void;
};

export default function CategoryMenu({ onSelectCategory }: MenuProps) {

  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);

  const categories = Object.keys(categoryTree);
  const mobileCategories = categories.slice(0, 15);

  const goToCategory = (category: string) => {
    const slug = slugify(category);
    onSelectCategory?.(category);
    router.push(`/category/${slug}`);
    setOpenModal(false);
  };

  return (
    <div className="py-4 px-2">

      {/* MOBILE MENU */}
      <div className="flex gap-4 overflow-x-auto md:hidden">

        {mobileCategories.map((category) => {

          const slug = slugify(category);

          return (
            <button
              key={category}
              onClick={() => goToCategory(category)}
              className="flex-shrink-0 flex flex-col items-center group"
            >

              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300 group-hover:border-orange-500">
                <Image
                src={categoryImages[category] || "/menu/default.jpg"}
                alt={category}
                width={64}
                height={64}
                unoptimized
                priority
                className="object-cover w-full h-full"
               />
              </div>

              <span className="text-xs mt-2 group-hover:text-orange-600">
                {category}
              </span>

            </button>
          );

        })}

        {/* VIEW ALL BUTTON */}
        <button
          onClick={() => setOpenModal(true)}
          className="flex-shrink-0 flex flex-col items-center"
        >

          <div className="w-16 h-16 rounded-full border-2 border-gray-300 flex items-center justify-center bg-gray-100 hover:border-orange-500">

            <span className="text-xs font-semibold">
              View All
            </span>

          </div>

          <span className="text-xs mt-2 text-gray-600">
            Categories
          </span>

        </button>

      </div>

      {/* DESKTOP MENU */}
      <div className="hidden md:flex gap-4 overflow-x-auto">

        {categories.map((category) => {

          const slug = slugify(category);

          return (
            <button
              key={category}
              onClick={() => goToCategory(category)}
              className="flex-shrink-0 flex flex-col items-center group"
            >

              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300 group-hover:border-orange-500">

                <Image
                src={categoryImages[category] || "/menu/default.jpg"}
                alt={category}
                width={64}
                height={64}
                unoptimized
                priority
                className="object-cover w-full h-full"
               />

              </div>

              <span className="text-xs mt-2 group-hover:text-orange-600">
                {category}
              </span>

            </button>
          );

        })}

      </div>

      {/* MODAL */}
      {openModal && (

        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">

          <div className="bg-orange-50 w-[95%] max-h-[85vh] rounded-lg p-4 overflow-y-auto">

            {/* Header */}
            <div className="flex justify-between items-center mb-4">

              <h2 className="text-lg font-semibold">
                All Categories
              </h2>

              <button
                onClick={() => setOpenModal(false)}
                className="text-sm text-gray-500"
              >
                Close
              </button>

            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-4">

              {categories.map((category) => {

                const slug = slugify(category);

                return (
                  <button
                    key={category}
                    onClick={() => goToCategory(category)}
                    className="flex flex-col items-center"
                  >

                    <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-300">

                <Image
                src={categoryImages[category] || "/menu/default.jpg"}
                alt={category}
                width={64}
                height={64}
                unoptimized
                priority
                className="object-cover w-full h-full"
               />

                    </div>

                    <span className="text-xs mt-2 text-center">
                      {category}
                    </span>

                  </button>
                );

              })}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}