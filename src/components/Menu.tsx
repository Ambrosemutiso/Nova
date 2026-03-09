'use client';

import { categoryTree } from '@/lib/productCategories';
import { slugify } from '@/lib/slugify';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type MenuProps = {
  onSelectCategory?: (category: string) => void;
};

export default function CategoryMenu({ onSelectCategory }: MenuProps) {

  const router = useRouter();

  return (
    <div className="py-4 px-2">

      <div className="flex gap-4 overflow-x-auto scrollbar-hide">

        {Object.keys(categoryTree).map((category) => {

          const slug = slugify(category);

          return (
            <button
              key={category}
              onClick={() => {
                onSelectCategory?.(category);
                router.push(`/category/${slug}`);
              }}
              className="flex-shrink-0 flex flex-col items-center group"
            >

              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300 group-hover:border-orange-500">

                <Image
                  src={`/Menu/${slug}.jpg`}
                  alt={category}
                  width={64}
                  height={64}
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

    </div>
  );
}