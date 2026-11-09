'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from './ProductCard';
import type { ProductType } from '@/app/types/product';
import {
  FaEye,
  FaChevronRight,
  FaRegCompass,
} from 'react-icons/fa';

export default function CustomersAlsoViewed({
  productId,
}: {
  productId: string;
}) {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          excludeId: productId,
        });

        const res = await fetch(
          `/api/products/alsoviewed?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          throw new Error('Failed to fetch recommended products');
        }

        const data = await res.json();

        if (!controller.signal.aborted) {
          setProducts(
            Array.isArray(data.products)
              ? data.products.filter(
                  (product: ProductType) =>
                    product._id !== productId
                ).slice(0, 15)
              : []
          );
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(
            'Error fetching also viewed products:',
            error
          );
          setProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => controller.abort();
  }, [productId]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="mt-10 border-t border-gray-100 pt-7">

      {/* Section heading */}
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <FaEye size={15} />
            </span>

            <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Popular discovery
            </p>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Customers Also Viewed
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Explore other products shoppers have shown interest in.
          </p>
        </div>

        {!loading && products.length > 0 && (
          <button
            type="button"
            onClick={() => router.push('/shop')}
            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-orange-600 transition hover:text-orange-700"
          >
            Explore more
            <FaChevronRight size={11} />
          </button>
        )}
      </div>

      {/* Products carousel */}
      <div className="relative">

        {loading ? (
          <div className="flex gap-4 overflow-hidden pb-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="w-[230px] shrink-0 animate-pulse overflow-hidden rounded-2xl border border-gray-100 sm:w-[255px]"
              >
                <div className="aspect-square bg-gray-100" />

                <div className="space-y-3 p-4">
                  <div className="h-4 w-4/5 rounded bg-gray-100" />
                  <div className="h-3 w-1/3 rounded bg-gray-100" />
                  <div className="h-5 w-2/3 rounded bg-gray-100" />
                  <div className="h-10 rounded-xl bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {products.map((product) => (
              <div
                key={product._id}
                className="w-[230px] shrink-0 snap-start sm:w-[255px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discovery footer */}
      {!loading && products.length > 0 && (
        <div className="mt-2 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3">
          <div className="flex items-center gap-2 text-gray-600">
            <FaRegCompass
              className="shrink-0 text-orange-500"
              size={15}
            />

            <span className="text-xs font-medium sm:text-sm">
              Find something else you might love
            </span>
          </div>

          <button
            type="button"
            onClick={() => router.push('/shop')}
            className="shrink-0 text-xs font-bold text-orange-600 transition hover:text-orange-700"
          >
            Browse products →
          </button>
        </div>
      )}
    </section>
  );
}