'use client';

import { useEffect, useState, useRef } from 'react';
import ProductCard from './ProductCard';
import type { ProductType } from "@/app/types/product";
import { toast } from 'react-toastify';

const FLASH_SALE_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

export default function FlashSales() {
  const [flashProducts, setFlashProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [timeLeft, setTimeLeft] = useState('');
  const saleEndRef = useRef<Date | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const initializeSaleEnd = () => {
    const now = new Date();
    const end = new Date(now.getTime() + FLASH_SALE_DURATION_MS);
    saleEndRef.current = end;
  };

  const fetchFlashSales = async () => {
    try {
      const res = await fetch('/api/products/flash-sales');
      const data = await res.json();
      const products = data.products || [];

      setFlashProducts(products);
      setSelectedCategory('All');

      // ✅ Extract categories from the fetched products
      const uniqueCategories = [...new Set(products.map((p: ProductType) => p.category))] as string[];
      setCategories(uniqueCategories);

      // ✅ Reset scroll
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = 0;
      }

      // ✅ Notify user
      toast.success('New flash sale started!');
    } catch (err) {
      console.error('Failed to fetch flash sale products:', err);
    }
  };

  useEffect(() => {
    initializeSaleEnd();
    fetchFlashSales();

    const timer = setInterval(() => {
      const now = new Date();
      const end = saleEndRef.current!;
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        initializeSaleEnd();
        fetchFlashSales();
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
          seconds
        ).padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const filtered = selectedCategory === 'All'
    ? flashProducts
    : flashProducts.filter((p) => p.category === selectedCategory);

  if (flashProducts.length === 0) return null;

  const progressPercent =
    saleEndRef.current && FLASH_SALE_DURATION_MS
      ? ((FLASH_SALE_DURATION_MS - (saleEndRef.current.getTime() - Date.now())) / FLASH_SALE_DURATION_MS) * 100
      : 0;

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-red-600">
          🔥 Flash Sales{' '}
          <span className="ml-2 text-sm text-black">Ends in: {timeLeft}</span>
        </h2>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border p-1 rounded text-sm"
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full bg-gray-200 rounded overflow-hidden mb-2">
        <div
          className="bg-red-500 h-full transition-all duration-1000"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        ref={scrollContainerRef}
      >
        {filtered.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
