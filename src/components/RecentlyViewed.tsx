
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FaHeart,
  FaRegHeart,
  FaStar,
  FaShoppingCart,
  FaChevronRight,
  FaClock,
} from 'react-icons/fa';

import type { ProductType } from '@/app/types/product';
import { useCart } from '@/app/context/CartContext';
import { addToWishlist, isInWishlist } from '@/lib/wishlist';

function RecentlyViewedCard({ product }: { product: ProductType }) {
  const router = useRouter();

  const {
    addToCart,
    cartItems,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const [wished, setWished] = useState(() => isInWishlist(product._id));
  const [imageFailed, setImageFailed] = useState(false);

  const cartItem = cartItems.find((item) => item.id === product._id);
  const inCart = !!cartItem;
  const cartQty = cartItem?.quantity ?? 0;

  const price = Number(product.calculatedPrice || 0);
  const oldPrice = Number(product.oldPrice || 0);

  const hasDiscount = oldPrice > price && oldPrice > 0;

  const discount = hasDiscount
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;

  const imageUrl = product.images?.[0] || '/placeholder.png';

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
      onClick={() => router.push(`/product/${product.slug || product._id}`)}
      className="group w-[230px] sm:w-[255px] shrink-0 snap-start
        overflow-hidden rounded-2xl border border-gray-100 bg-white
        transition-all duration-300 hover:-translate-y-1
        hover:border-orange-200 hover:shadow-lg cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {!imageFailed ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="255px"
            unoptimized
            onError={() => setImageFailed(true)}
            className="object-contain p-4 transition-transform duration-500
              group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <FaShoppingCart size={36} />
          </div>
        )}

        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-lg bg-red-500
            px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            -{discount}%
          </span>
        )}

        {product.quantity === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/65">
            <span className="rounded-full border border-gray-200 bg-white
              px-3 py-1.5 text-xs font-bold text-gray-600">
              Out of Stock
            </span>
          </div>
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
            className="absolute right-3 top-3 flex h-9 w-9 items-center
              justify-center rounded-full bg-white/95 text-gray-600
              shadow-sm transition hover:bg-orange-50
              hover:text-orange-600 active:scale-95"
          >
            {wished ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart />
            )}
          </button>
        )}
      </div>

      {/* Product details */}
      <div className="flex flex-col p-4">
        <h3 className="min-h-[42px] line-clamp-2 text-sm font-semibold
          leading-5 text-gray-800 transition-colors group-hover:text-orange-600">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
          <FaStar className="text-amber-400" />
          <span>
            {product.averageRating ?? product.rating
              ? Number(product.averageRating ?? product.rating).toFixed(1)
              : 'New'}
          </span>
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

        {/* Cart controls */}
        {product.quantity > 0 ? (
          inCart ? (
            <div className="mt-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    decreaseQuantity(product._id);
                  }}
                  className="flex h-8 w-8 items-center justify-center
                    rounded-lg bg-orange-50 text-lg font-bold
                    text-orange-700 transition hover:bg-orange-100
                    active:scale-95"
                >
                  −
                </button>

                <span className="w-5 text-center text-sm font-bold tabular-nums">
                  {cartQty}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    increaseQuantity(product._id);
                  }}
                  className="flex h-8 w-8 items-center justify-center
                    rounded-lg bg-orange-500 text-lg font-bold
                    text-white transition hover:bg-orange-600
                    active:scale-95"
                >
                  +
                </button>
              </div>

              <span className="text-[11px] font-semibold text-orange-600">
                In Cart
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-4 flex w-full items-center justify-center
                gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm
                font-semibold text-white transition hover:bg-orange-700
                active:scale-[0.98]"
            >
              <FaShoppingCart size={13} />
              Add to Cart
            </button>
          )
        ) : (
          <button
            type="button"
            disabled
            className="mt-4 w-full cursor-not-allowed rounded-xl
              bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-400"
          >
            Out of Stock
          </button>
        )}
      </div>
    </article>
  );
}

function RecentlyViewedSkeleton() {
  return (
    <div className="w-[230px] sm:w-[255px] shrink-0 overflow-hidden
      rounded-2xl border border-gray-100 animate-pulse">
      <div className="aspect-square bg-gray-100" />

      <div className="space-y-3 p-4">
        <div className="h-4 w-4/5 rounded bg-gray-100" />
        <div className="h-3 w-1/3 rounded bg-gray-100" />
        <div className="h-5 w-2/3 rounded bg-gray-100" />
        <div className="h-10 rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}

export default function RecentlyViewed() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();

    const fetchViewed = async () => {
      try {
        const stored = localStorage.getItem('recentlyViewed');

        if (!stored) {
          setProducts([]);
          return;
        }

        let ids: unknown;

        try {
          ids = JSON.parse(stored);
        } catch {
          console.error('Invalid recentlyViewed data in localStorage');
          localStorage.removeItem('recentlyViewed');
          setProducts([]);
          return;
        }

        if (
          !Array.isArray(ids) ||
          ids.length === 0 ||
          !ids.every((id) => typeof id === 'string')
        ) {
          setProducts([]);
          return;
        }

        const uniqueIds = [...new Set(ids)].slice(0, 20);

        const res = await fetch('/api/products/recentlyviewed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: uniqueIds }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error('Failed to fetch recently viewed products');
        }

        const data = await res.json();

        if (!controller.signal.aborted) {
          setProducts(
            Array.isArray(data.products) ? data.products : []
          );
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch recently viewed:', err);
          setProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchViewed();

    return () => controller.abort();
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="mt-10 border-t border-gray-100 pt-7">
      {/* Heading */}
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center
              rounded-xl bg-orange-50 text-orange-600">
              <FaClock size={15} />
            </span>

            <span className="text-xs font-semibold uppercase tracking-wider text-orange-600">
              Your browsing history
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Recently Viewed
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Pick up where you left off.
          </p>
        </div>

        {!loading && products.length > 0 && (
          <button
            type="button"
            onClick={() => router.push('/shop')}
            className="flex shrink-0 items-center gap-1 text-sm
              font-semibold text-orange-600 transition hover:text-orange-700"
          >
            Explore more <FaChevronRight size={11} />
          </button>
        )}
      </div>

      {/* Product carousel */}
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto
        px-1 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <RecentlyViewedSkeleton key={index} />
            ))
          : products.map((product) => (
              <RecentlyViewedCard
                key={product._id}
                product={product}
              />
            ))}
      </div>
    </section>
  );
}
