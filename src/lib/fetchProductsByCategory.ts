// lib/fetchProductsByCategory.ts
import {Product} from '@/app/types/product';

export const fetchProductsByCategory = async (category: string): Promise<Product[]> => {
  const res = await fetch('/api/products/all');
  const data = await res.json();
  return category === 'Shop'
    ? data.products
    : data.products.filter((product: Product) => product.category === category);
};
