'use client';

import { useState } from 'react';
import { categoryTree } from '@/lib/productCategories';
import { slugify } from '@/lib/slugify';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { categoryImages } from '@/lib/categoryImages';
import { Section } from './SectionWrapper';
import { FiGrid, FiX } from 'react-icons/fi';

type MenuProps = {
  onSelectCategory?: (category: string) => void;
};

export default function Menu({
  onSelectCategory,
}: MenuProps) {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);

  const categories = Object.keys(categoryTree);
  const mobileCategories = categories.slice(0, 12);

  const goToCategory = (category: string) => {
    const slug = slugify(category);

    onSelectCategory?.(category);

    router.push(`/category/${slug}`);
    setOpenModal(false);
  };

  return (
    <Section>
      <div className="py-3">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="text-lg font-bold">
              Browse Categories
            </h2>

            <p className="text-xs text-gray-500">
              Discover products across all departments
            </p>
          </div>
        </div>

        {/* CATEGORY STRIP */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">

          {mobileCategories.map((category) => (
            <button
              key={category}
              onClick={() => goToCategory(category)}
              className="group flex-shrink-0"
            >
              <div
                className="
                  relative
                  w-[80px]
                  h-[110px]
                  rounded-3xl
                  overflow-hidden

                  border
                  border-white/10

                  bg-white/5
                  backdrop-blur-md

                  shadow-lg
                  shadow-black/10

                  transition-all
                  duration-300

                  hover:scale-105
                  hover:border-orange-500/50
                  hover:shadow-orange-500/20
                "
              >
                <Image
                  src={
                    categoryImages[category] ||
                    '/menu/default.jpg'
                  }
                  alt={category}
                  fill
                  priority
                  unoptimized
                  className="
                    object-cover
                    transition-transform
                    duration-500
                    group-hover:scale-110
                  "
                />

                {/* Dark Glass Overlay */}
                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black/80
                    via-black/30
                    to-transparent
                  "
                />

                {/* Glow */}
                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-b
                    from-orange-500/10
                    to-transparent
                  "
                />

                {/* Category Name */}
                <div className="absolute bottom-2 left-2 right-2">
                  <span
                    className="
                      text-white
                      text-[11px]
                      font-semibold
                      leading-tight
                      line-clamp-2
                    "
                  >
                    {category}
                  </span>
                </div>
              </div>
            </button>
          ))}

          {/* EXPLORE ALL */}
          <button
            onClick={() => setOpenModal(true)}
            className="flex-shrink-0"
          >
            <div
              className="
                w-[80px]
                h-[110px]

                rounded-3xl

                bg-gradient-to-br
                from-orange-500
                via-orange-500
                to-orange-600

                shadow-lg
                shadow-orange-500/30

                flex
                flex-col
                items-center
                justify-center

                transition-all
                duration-300

                hover:scale-105
              "
            >
              <FiGrid
                size={26}
                className="text-white mb-2"
              />

              <span className="text-white text-xs font-semibold">
                Explore All
              </span>
            </div>
          </button>
        </div>

        {/* MODAL */}
        {openModal && (
          <div
            className="
              fixed
              inset-0
              z-[999999999999999]

              bg-black/70
              backdrop-blur-md

              flex
              items-center
              justify-center
              p-4
            "
          >
            <div
              className="
                w-full
                max-w-5xl

                max-h-[90vh]

                overflow-y-auto

                rounded-3xl

                bg-zinc-900/95

                border
                border-white/10

                shadow-2xl
              "
            >
              {/* Header */}
              <div
                className="
                  sticky
                  top-0

                  bg-zinc-900/95

                  backdrop-blur-md

                  p-5

                  border-b
                  border-white/10

                  flex
                  items-center
                  justify-between
                "
              >

                <button
                  onClick={() => setOpenModal(false)}
                  className="
                    w-10
                    h-10

                    rounded-xl

                    bg-white/5

                    flex
                    items-center
                    justify-center

                    text-white

                    hover:bg-white/10
                  "
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4 p-5">

                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => goToCategory(category)}
                    className="group"
                  >
                    <div
                      className="
                        relative
                        aspect-square

                        rounded-2xl
                        overflow-hidden

                        border
                        border-white/10

                        hover:border-orange-500/50

                        transition-all
                        duration-300
                      "
                    >
                      <Image
                        src={
                          categoryImages[category] ||
                          '/menu/default.jpg'
                        }
                        alt={category}
                        fill
                        unoptimized
                        className="
                          object-cover
                          transition-transform
                          duration-500
                          group-hover:scale-110
                        "
                      />

                      <div
                        className="
                          absolute
                          inset-0
                          bg-gradient-to-t
                          from-black/80
                          via-black/20
                          to-transparent
                        "
                      />

                      <div
                        className="
                          absolute
                          bottom-2
                          left-2
                          right-2
                        "
                      >
                        <span
                          className="
                            text-white
                            text-xs
                            font-medium
                            line-clamp-2
                          "
                        >
                          {category}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}