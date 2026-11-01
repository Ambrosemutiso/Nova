
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { ProductType } from '@/app/types/product';
import { Section } from './SectionWrapper';
import { useCart } from '@/app/context/CartContext';
import { addToWishlist, isInWishlist } from '@/lib/wishlist';
import {
  FaHeart,
  FaShoppingCart,
  FaStar,
  FaArrowRight,
  FaTrophy,
  FaMinus,
  FaPlus,
} from 'react-icons/fa';

function TopPickCard({ product }: { product: ProductType }) {
  const router = useRouter();

  const {
    addToCart,
    cartItems,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const [wished, setWished] = useState(
    () => isInWishlist(product._id)
  );

  const [imageError, setImageError] = useState(false);

  const stock = Number(product.quantity || 0);
  const inStock = stock > 0;

  const cartItem = cartItems.find(
    item => item.id === product._id
  );

  const cartQuantity = cartItem?.quantity || 0;

  const price = Number(product.calculatedPrice || 0);
  const oldPrice = Number(product.price || 0);

  const hasDiscount = oldPrice > price && price > 0;

  const discount = hasDiscount
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;

  const rating = Number(
    product.averageRating ?? product.rating ?? 0
  );

  const openProduct = () => {
    router.push(`/product/${product.slug || product._id}`);
  };

  const handleAddToCart = () => {
    if (!inStock) return;

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
    <article className="group w-[210px] shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg sm:w-[230px] md:w-[245px]">
      {/* Image */}
      <div
        onClick={openProduct}
        className="relative h-[175px] cursor-pointer overflow-hidden bg-gray-50 sm:h-[190px]"
      >
        <Image
          src={
            imageError
              ? '/placeholder.png'
              : product.images?.[0] || '/placeholder.png'
          }
          alt={product.name}
          fill
          unoptimized
          onError={() => setImageError(true)}
          className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
          sizes="245px"
        />

        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-orange-600 px-2 py-1 text-[10px] font-bold text-white">
          <FaTrophy size={10} />
          Top Pick
        </span>

        {hasDiscount && (
          <span className="absolute bottom-2 left-2 rounded-md bg-red-600 px-2 py-1 text-[10px] font-bold text-white">
            -{discount}%
          </span>
        )}

        <button
          type="button"
          disabled={!inStock}
          onClick={e => {
            e.stopPropagation();
            addToWishlist(product);
            setWished(!wished);
          }}
          className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition ${
            !inStock
              ? 'hidden'
              : wished
                ? 'text-red-500'
                : 'text-gray-500 hover:text-red-500'
          }`}
          aria-label="Add to wishlist"
        >
          <FaHeart size={14} />
        </button>

        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/65">
            <span className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3">
        <button
          type="button"
          onClick={openProduct}
          className="mb-2 block w-full text-left"
        >
          <h3 className="line-clamp-2 min-h-[40px] text-sm font-medium leading-5 text-gray-800 transition-colors group-hover:text-orange-600">
            {product.name}
          </h3>
        </button>

        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs">
            <FaStar className="text-amber-400" />
            <span className="font-semibold text-gray-700">
              {rating > 0 ? rating.toFixed(1) : 'New'}
            </span>
          </div>

          {inStock && (
            <span className="text-[10px] font-medium text-green-600">
              In Stock
            </span>
          )}
        </div>

        <div className="mb-3 flex min-h-[42px] flex-col justify-center">
          <span className="text-base font-bold text-gray-900">
            KSh {price.toLocaleString('en-KE')}
          </span>

          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              KSh {oldPrice.toLocaleString('en-KE')}
            </span>
          )}
        </div>

        {/* Cart controls */}
        {cartQuantity > 0 ? (
          <div className="flex h-9 items-center justify-between rounded-lg border border-orange-200 bg-orange-50 px-2">
            <button
              type="button"
              onClick={() => decreaseQuantity(product._id)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-orange-700 hover:bg-orange-100"
              aria-label="Decrease quantity"
            >
              <FaMinus size={10} />
            </button>

            <span className="text-sm font-bold text-gray-800">
              {cartQuantity}
            </span>

            <button
              type="button"
              onClick={() => increaseQuantity(product._id)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-orange-700 hover:bg-orange-100"
              aria-label="Increase quantity"
            >
              <FaPlus size={10} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={!inStock}
            onClick={handleAddToCart}
            className={`flex h-9 w-full items-center justify-center gap-2 rounded-lg text-xs font-semibold transition ${
              inStock
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'cursor-not-allowed bg-gray-100 text-gray-400'
            }`}
          >
            {inStock ? (
              <>
                <FaShoppingCart size={12} />
                Add to Cart
              </>
            ) : (
              'Unavailable'
            )}
          </button>
        )}
      </div>
    </article>
  );
}

function TopPicksSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3, 4].map(item => (
        <div
          key={item}
          className="w-[210px] shrink-0 animate-pulse overflow-hidden rounded-xl border border-gray-100"
        >
          <div className="h-[175px] bg-gray-100" />
          <div className="space-y-3 p-3">
            <div className="h-4 rounded bg-gray-100" />
            <div className="h-4 w-2/3 rounded bg-gray-100" />
            <div className="h-6 w-1/2 rounded bg-gray-100" />
            <div className="h-9 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TopPicksForYou() {
  const router = useRouter();

  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchTopPicks = async () => {
      try {
        const stored = localStorage.getItem('viewCounts');
        const counts = stored ? JSON.parse(stored) : {};

        if (
          !counts ||
          typeof counts !== 'object' ||
          Array.isArray(counts)
        ) {
          setProducts([]);
          return;
        }

        const sortedIds = (
          Object.entries(counts) as [string, number][]
        )
          .filter(([id, count]) => id && Number.isFinite(Number(count)))
          .sort((a, b) => Number(b[1]) - Number(a[1]))
          .map(([id]) => id)
          .slice(0, 6);

        if (!sortedIds.length) {
          setProducts([]);
          return;
        }

        const res = await fetch('/api/top-picks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: sortedIds }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error('Failed to fetch top picks');
        }

        const data = await res.json();

        setProducts(
          Array.isArray(data)
            ? data
            : Array.isArray(data.products)
              ? data.products
              : []
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Top picks error:', error);
          setProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchTopPicks();

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <Section>
        <div className="px-1 py-3">
          <TopPicksSkeleton />
        </div>
      </Section>
    );
  }

  if (!products.length) return null;

  return (
    <Section>
      <section className="px-1 py-3">
        {/* Heading */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <FaTrophy size={18} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                Top Picks For You
              </h2>
              <p className="text-xs text-gray-500">
                Your most-viewed product interests
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/shop')}
            className="flex shrink-0 items-center gap-1 text-xs font-semibold text-orange-600 transition hover:text-orange-700"
          >
            Explore
            <FaArrowRight size={10} />
          </button>
        </div>

        {/* Products */}
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 sm:gap-4">
          {products.map(product => (
            <div key={product._id} className="snap-start">
              <TopPickCard product={product} />
            </div>
          ))}
        </div>
      </section>
    </Section>
  );
}
