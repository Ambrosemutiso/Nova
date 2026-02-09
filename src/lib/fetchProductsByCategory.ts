// lib/fetchProductsByCategory.ts
import type { ProductType } from "@/app/types/product";

export const fetchProductsByCategory = async (category: string): Promise<ProductType[]> => {
  const res = await fetch('/api/products/all');
  const data = await res.json();
  return category === 'Shop'
    ? data.products
    : data.products.filter((product: ProductType) => product.category === category);
};
