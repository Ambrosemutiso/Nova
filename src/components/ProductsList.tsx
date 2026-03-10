'use client';

import { useState } from 'react';
import { categoryTree } from '@/lib/productCategories';
import CategorySection from './categorySection';
import CategoryProducts from './CategoryProducts';
import { slugify } from '@/lib/slugify';

interface ProductsListProps {
  category: string;
}

export default function ProductsList({ category }: ProductsListProps) {

  const [activeCategories, setActiveCategories] = useState<string[]>([]);

  const handleCategoryLoaded = (categoryName: string, count: number) => {
    if (count > 0) {
      setActiveCategories(prev => {
        if (prev.includes(categoryName)) return prev;
        return [...prev, categoryName];
      });
    }
  };

  return (
    <>
      {Object.keys(categoryTree).map((cat) => {

        const slug = slugify(cat);

        // Hide category if it has not reported products yet
        if (!activeCategories.includes(cat)) {
          return (
            <CategoryProducts
              key={slug}
              category={cat}
              onLoaded={(count) => handleCategoryLoaded(cat, count)}
              hidden
            />
          );
        }

        return (
          <CategorySection
            key={slug}
            title={cat}
            categorySlug={slug}
          >
            <CategoryProducts
              category={cat}
              onLoaded={(count) => handleCategoryLoaded(cat, count)}
            />
          </CategorySection>
        );

      })}
    </>
  );
}