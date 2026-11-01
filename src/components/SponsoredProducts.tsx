
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CldImage } from 'next-cloudinary';
import {
  Star,
  Heart,
  ShoppingCart,
  Check,
  ChevronRight,
  Tag,
} from 'lucide-react';

import type { ProductType } from '@/app/types/product';
import { useCart } from '@/app/context/CartContext';
import { addToWishlist, isInWishlist } from '@/lib/wishlist';
import { Section } from './SectionWrapper';

/* ── Cloudinary image helper ── */
const getPublicId = (url?: string) => {
  if (!url) return '';

  const match = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
  return match?.[1] ?? url;
};

/* ── Rating ── */
function Rating({ rating = 0 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= Math.round(rating)
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-200 fill-gray-200'
            }`}
          />
        ))}
      </div>

      <span className="text-[11px] text-gray-500 font-medium">
        {rating > 0 ? rating.toFixed(1) : 'New'}
      </span>
    </div>
  );
}

/* ── Individual sponsored card ── */
function SponsoredCard({ product }: { product: ProductType }) {
  const router = useRouter();

  const {
    addToCart,
    cartItems,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const [wished, setWished] = useState(() => isInWishlist(product._id));
  const [imageLoaded, setImageLoaded] = useState(false);

  const cartItem = cartItems.find((item) => item.id === product._id);
  const inCart = Boolean(cartItem);
  const cartQty = cartItem?.quantity ?? 0;

  const discount =
    product.oldPrice &&
    product.oldPrice > product.calculatedPrice
      ? Math.round(
          ((product.oldPrice - product.calculatedPrice) /
            product.oldPrice) *
            100
        )
      : null;

  const goToProduct = () => {
    router.push(`/product/${product.slug}`);
  };

  const handleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    addToWishlist(product);
    setWished(!wished);
  };

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
      className="group flex flex-col flex-shrink-0 w-[245px] sm:w-[265px]
        bg-white rounded-2xl border border-gray-100 overflow-hidden
        transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
        hover:shadow-gray-200/70 hover:border-orange-100"
    >
      {/* ── Product image ── */}
      <div
        onClick={goToProduct}
        className="relative aspect-[5/4] bg-gray-50 overflow-hidden cursor-pointer"
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}

        <CldImage
          src={getPublicId(product.images?.[0]) || 'sample'}
          alt={product.name}
          width={600}
          height={480}
          crop="fill"
          className={`w-full h-full object-cover transition-all duration-500
            group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Sponsored label */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1.5
            bg-white/95 backdrop-blur-sm text-gray-600
            text-[10px] font-semibold px-2.5 py-1.5 rounded-full
            shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Sponsored
          </span>
        </div>

        {/* Discount */}
        {discount && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="bg-red-500 text-white text-xs
              font-bold px-2.5 py-1.5 rounded-lg shadow-sm"
            >
              {discount}% OFF
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 z-10 w-9 h-9
            rounded-full bg-white/95 backdrop-blur-sm shadow-sm
            flex items-center justify-center
            transition-all hover:scale-110 active:scale-95"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              wished
                ? 'text-red-500 fill-red-500'
                : 'text-gray-500'
            }`}
          />
        </button>

        {/* Out of stock */}
        {product.quantity === 0 && (
          <div className="absolute inset-0 bg-white/65
            flex items-center justify-center"
          >
            <span className="bg-white text-gray-600 border
              border-gray-200 px-4 py-2 rounded-full
              text-xs font-bold shadow-sm"
            >
              Currently unavailable
            </span>
          </div>
        )}
      </div>

      {/* ── Product information ── */}
      <div className="flex flex-col flex-1 p-4">

        {/* Product name */}
        <button
          type="button"
          onClick={goToProduct}
          className="text-left text-sm font-semibold text-gray-900
            leading-snug line-clamp-2 min-h-[40px]
            hover:text-orange-600 transition-colors"
        >
          {product.name}
        </button>

        {/* Rating */}
        <div className="mt-2">
          <Rating
            rating={product.averageRating ?? product.rating ?? 0}
          />
        </div>

        {/* Price */}
        <div className="mt-3 flex items-baseline flex-wrap gap-x-2 gap-y-1">
          <span className="text-xl font-black text-gray-900 tracking-tight">
            Ksh {product.calculatedPrice.toLocaleString()}
          </span>

          {product.oldPrice > product.calculatedPrice && (
            <span className="text-xs text-gray-400 line-through">
              Ksh {product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Cart action */}
        <div className="mt-auto pt-4">
          {product.quantity === 0 ? (
            <button
              type="button"
              disabled
              className="w-full rounded-xl py-3 bg-gray-100
                text-gray-400 text-xs font-bold cursor-not-allowed"
            >
              Out of Stock
            </button>
          ) : inCart ? (
            <div className="flex items-center justify-between gap-2
              border border-orange-100 bg-orange-50/60
              rounded-xl p-2"
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => decreaseQuantity(product._id)}
                  aria-label="Decrease quantity"
                  className="w-8 h-8 rounded-lg bg-white
                    border border-orange-100 text-orange-700
                    font-bold flex items-center justify-center
                    hover:bg-orange-100 transition"
                >
                  −
                </button>

                <span className="text-sm font-bold text-gray-900
                  w-5 text-center tabular-nums"
                >
                  {cartQty}
                </span>

                <button
                  type="button"
                  onClick={() => increaseQuantity(product._id)}
                  aria-label="Increase quantity"
                  className="w-8 h-8 rounded-lg bg-orange-500
                    text-white font-bold flex items-center justify-center
                    hover:bg-orange-600 transition"
                >
                  +
                </button>
              </div>

              <span className="flex items-center gap-1
                text-[10px] font-bold text-green-600"
              >
                <Check className="w-3.5 h-3.5" />
                In cart
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center
                gap-2 bg-orange-500 hover:bg-orange-600
                active:scale-[0.98] text-white text-xs font-bold
                py-3 rounded-xl transition-all duration-200
                shadow-sm shadow-orange-200"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SPONSORED PRODUCTS SECTION
═══════════════════════════════════════════════════════════════ */
export default function SponsoredProducts() {
  const [sponsored, setSponsored] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchSponsored = async () => {
      try {
        const res = await fetch('/api/products/sponsored', {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error('Failed to load sponsored products');
        }

        const data = await res.json();

        if (!controller.signal.aborted) {
          setSponsored(data.products || []);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch sponsored products:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchSponsored();

    return () => controller.abort();
  }, []);

  if (!loading && sponsored.length === 0) {
    return null;
  }

  return (
    <Section>
      <section className="w-full">

        {/* Section heading */}
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1 h-5 bg-orange-500 rounded-full" />
              <span className="text-[10px] font-bold
                uppercase tracking-[0.16em] text-orange-600"
              >
                Promoted picks
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black
              text-gray-900 tracking-tight"
            >
              Sponsored Products
            </h2>

            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Discover products promoted by our sellers.
            </p>
          </div>

          {sponsored.length > 0 && (
            <span className="text-xs font-medium text-gray-400
              whitespace-nowrap pb-1"
            >
              {sponsored.length} products
            </span>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex gap-4 overflow-hidden pb-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex-shrink-0 w-[245px] sm:w-[265px]
                  rounded-2xl border border-gray-100 overflow-hidden"
              >
                <div className="aspect-[5/4] bg-gray-100 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-3 w-4/5 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
                  <div className="h-6 w-2/3 bg-gray-100 rounded animate-pulse" />
                  <div className="h-10 w-full bg-gray-100 rounded-xl animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product carousel */}
        {!loading && sponsored.length > 0 && (
          <div
            className="flex gap-4 overflow-x-auto overflow-y-hidden
              pb-5 pt-1 px-0.5 snap-x snap-mandatory
              scrollbar-thin scrollbar-thumb-gray-200
              scrollbar-track-transparent"
          >
            {sponsored.map((product) => (
              <div
                key={product._id}
                className="snap-start"
              >
                <SponsoredCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>
    </Section>
  );
}
