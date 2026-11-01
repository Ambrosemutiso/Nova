
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  FaHeart,
  FaRegHeart,
  FaStar,
  FaShoppingCart,
  FaChevronRight,
  FaRecycle,
  FaCheckCircle,
} from 'react-icons/fa';

import type { ProductType } from '@/app/types/product';
import { Section } from './SectionWrapper';
import { useCart } from '@/app/context/CartContext';
import { addToWishlist, isInWishlist } from '@/lib/wishlist';

function getImageUrl(product: ProductType) {
  return product.images?.[0] || '/placeholder.png';
}

function getCondition(product: ProductType): 'Used' | 'Refurbished' {
  const condition = String(
    (product as any).condition || (product as any).productCondition || ''
  ).toLowerCase();

  return condition.includes('refurb') ? 'Refurbished' : 'Used';
}

function UsedProductCard({ product }: { product: ProductType }) {
  const router = useRouter();
  const { addToCart } = useCart();
const [wished, setWished] = useState(() => isInWishlist(product._id));

  const [imageFailed, setImageFailed] = useState(false);

  const condition = getCondition(product);
  const price = Number(product.calculatedPrice || 0);
  const oldPrice = Number(product.oldPrice || 0);
  const hasDiscount = oldPrice > price && oldPrice > 0;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    addToCart({
      id: product._id,
      productId: product._id,
      name: product.name,
      images: product.images ?? [],
      brand: product.brand,
      model: product.model,
      quantity: 1,
      calculatedPrice: product.calculatedPrice,
      fulfillmentMode: product.fulfillmentMode,
      sellerId: product.sellerId,
      county: product.county,
      town: product.town,
      weight: product.weight,
    });
  };

  return (
    <article
      onClick={() => router.push(`/product/${product._id}`)}
      className="group w-[245px] sm:w-[265px] shrink-0 snap-start overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg cursor-pointer"
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-gray-50">
        {!imageFailed ? (
          <Image
            src={getImageUrl(product)}
            alt={product.name}
            fill
            sizes="265px"
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageFailed(true)}
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <FaRecycle size={42} />
          </div>
        )}

        <div className="absolute left-3 top-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${
              condition === 'Refurbished'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-orange-50 text-orange-700'
            }`}
          >
            {condition === 'Refurbished' ? (
              <FaCheckCircle size={11} />
            ) : (
              <FaRecycle size={11} />
            )}
            {condition}
          </span>
        </div>

        {hasDiscount && (
          <span className="absolute bottom-3 left-3 rounded-lg bg-orange-600 px-2.5 py-1 text-xs font-bold text-white">
            {Math.round(((oldPrice - price) / oldPrice) * 100)}% OFF
          </span>
        )}

        {product.quantity > 0 && (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      addToWishlist(product);
      setWished(!wished);
    }}
    aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center
      rounded-full bg-white/95 text-gray-600 shadow-sm transition
      hover:bg-orange-50 hover:text-orange-600 active:scale-95"
  >
    {wished ? (
      <FaHeart className="text-red-500" />
    ) : (
      <FaRegHeart />
    )}
  </button>
)}
      </div>

      <div className="p-4">
        <h3 className="min-h-[42px] line-clamp-2 text-sm font-semibold leading-5 text-gray-800">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
          <FaStar className="text-amber-400" />
          <span>
            {product.rating ? Number(product.rating).toFixed(1) : 'New'}
          </span>
          <span className="text-gray-300">•</span>
          <span>{condition} condition</span>
        </div>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-lg font-bold text-gray-900">
            KSh {price.toLocaleString('en-KE')}
          </span>

          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              KSh {oldPrice.toLocaleString('en-KE')}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 active:scale-[0.98]"
        >
          <FaShoppingCart size={13} />
          Add to Cart
        </button>
      </div>
    </article>
  );
}

function ProductSkeleton() {
  return (
    <div className="w-[245px] shrink-0 animate-pulse overflow-hidden rounded-2xl border border-gray-100">
      <div className="aspect-[5/4] bg-gray-100" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-gray-100" />
        <div className="h-3 w-1/2 rounded bg-gray-100" />
        <div className="h-5 w-2/3 rounded bg-gray-100" />
        <div className="h-10 rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}

export default function UsedRefurbishedProducts() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products/refurbished', {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error('Failed to load products');
        }

        const data = await res.json();
        setProducts(Array.isArray(data.products) ? data.products : []);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch used/refurbished products:', err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => controller.abort();
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <Section>
      <section className="py-3">
        <div className="mb-5 flex items-end justify-between gap-3 px-1">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <FaRecycle size={16} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-600">
                Great value finds
              </span>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Used & Refurbished Deals
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              More value from products worth having.
            </p>
          </div>

          {!loading && products.length > 0 && (
            <button
              type="button"
              onClick={() => router.push('/category/used-refurbished')}
              className="flex shrink-0 items-center gap-1 text-sm font-semibold text-orange-600 transition hover:text-orange-700"
            >
              View all <FaChevronRight size={11} />
            </button>
          )}
        </div>

        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))
            : products.map((product) => (
                <UsedProductCard key={product._id} product={product} />
              ))}
        </div>
      </section>
    </Section>
  );
}
