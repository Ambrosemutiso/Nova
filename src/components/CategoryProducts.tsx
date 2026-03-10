'use client';

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { slugify } from "@/lib/slugify";
import type { ProductType } from "@/app/types/product";

interface Props {
  category: string;
  onLoaded?: (count: number) => void;
  hidden?: boolean;
}

export default function CategoryProducts({ category, onLoaded, hidden }: Props) {

  const [products,setProducts] = useState<ProductType[]>([]);

  useEffect(()=>{

    const slug = slugify(category);

    fetch(`/api/products/category/${slug}?limit=10`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        onLoaded?.(data.products?.length || 0);
      });

  },[category]);

  if(hidden) return null;

  return (

    <div className="flex gap-4 overflow-x-auto">

      {products.map(product => (
        <ProductCard key={product._id} product={product}/>
      ))}

    </div>

  );

}