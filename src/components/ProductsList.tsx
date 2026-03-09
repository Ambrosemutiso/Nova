'use client';

import { categoryTree } from '@/lib/productCategories';
import CategorySection from './categorySection';
import CategoryProducts from './CategoryProducts';
import { slugify } from '@/lib/slugify';

interface ProductsListProps {
  category: string;
}

export default function ProductsList({ category }: ProductsListProps) {

  return (

    <>
      {Object.keys(categoryTree).map((category)=>{

        const slug = slugify(category);

        return (

          <CategorySection
            key={slug}
            title={category}
            categorySlug={slug}
          >

            <CategoryProducts category={category}/>

          </CategorySection>

        );

      })}
    </>

  );

}