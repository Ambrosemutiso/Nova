'use client';

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import type { ProductType } from "@/app/types/product";

export default function CategoryProducts({ category }: { category: string }) {

  const [products,setProducts] = useState<ProductType[]>([]);

  useEffect(()=>{

    fetch(`/api/products?category=${category}&limit=10`)
      .then(res => res.json())
      .then(data => setProducts(data.products));

  },[category]);

  return (

    <div className="flex gap-4 overflow-x-auto">

      {products.map(product => (
        <ProductCard key={product._id} product={product}/>
      ))}

    </div>

  );

}