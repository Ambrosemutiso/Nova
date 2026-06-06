'use client';

import { useRouter } from 'next/navigation';
import { CldImage } from 'next-cloudinary';
import type { ProductType } from "@/app/types/product";
import { useCart } from '@/app/context/CartContext';
import {
  MapPin, Star, ShieldCheck, Zap, CreditCard,
  ShoppingCart, BadgeCheck, Clock,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface ProductCardProps {
  product: ProductType;
  showSponsoredBadge?: boolean;
  redirectAllTo?: string;
  index?: number; // for staggered entrance animation
}

export default function ProductCard({
  product,
  showSponsoredBadge,
  redirectAllTo,
  index = 0,
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart, cartItems } = useCart();
  const [visible, setVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addedFlash, setAddedFlash] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  /* ── Scroll-triggered entrance ── */
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── Helpers ── */
  const getPublicId = (url: string) => {
    const match = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
    return match ? match[1] : url;
  };

  const handleNavigate = () =>
    router.push(redirectAllTo ?? `/product/${product.slug}`);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product._id,
      name: product.name,
      images: product.images,
      brand: product.brand,
      model: product.model,
      county: product.county,
      town: product.town,
      weight: product.weight,
      calculatedPrice: product.calculatedPrice,
      quantity: 1,
      fulfillmentMode: product.fulfillmentMode,
      sellerId: product.sellerId,
      productId: product._id,
    });
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 1500);
  };

  /* ── Derived values ── */
  const inCart = cartItems.some((i) => i.id === product._id);
  const discount = product.oldPrice && product.oldPrice > product.calculatedPrice
    ? Math.round(((product.oldPrice - product.calculatedPrice) / product.oldPrice) * 100)
    : null;
  const isLowStock = product.quantity > 0 && product.quantity <= 5;
  const isOutOfStock = product.quantity === 0;
  const hasInstallment = product.installmentEnabled;
  const hasWarranty = Boolean(product.warranty);
  const rating = product.averageRating ?? product.rating ?? 0;
  const reviews = product.reviewCount ?? 0;

  const staggerDelay = Math.min(index * 60, 400); // cap at 400ms

  return (
    <div
      ref={cardRef}
      className="group relative flex flex-col w-52 flex-shrink-0 bg-white rounded-2xl overflow-hidden
        border border-gray-100 shadow-sm
        hover:shadow-xl hover:-translate-y-1
        transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.45s ease ${staggerDelay}ms, transform 0.45s ease ${staggerDelay}ms,
                     box-shadow 0.3s ease, translate 0.3s ease`,
      }}
    >
      {/* ══ Image area ══ */}
      <div
        className="relative overflow-hidden cursor-pointer bg-gray-50"
        style={{ height: '176px' }}
        onClick={handleNavigate}
      >
        {/* Image with zoom */}
        <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
          <CldImage
            src={getPublicId(product.images[0])}
            alt={product.name}
            width="300"
            height="300"
            crop="fill"
            className={`w-full h-44 object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            placeholder="blur"
            blurDataURL={`${getPublicId(product.images[0])}?blur=200`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        {/* Skeleton shimmer while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-[shimmer_1.4s_infinite]" />
        )}

        {/* Discount badge */}
        {discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black
            px-1.5 py-0.5 rounded-lg shadow-md animate-[fadeIn_0.3s_ease]">
            -{discount}%
          </div>
        )}

        {/* Sponsored badge */}
        {showSponsoredBadge && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm
            px-2 py-1 rounded-lg shadow text-[10px] font-semibold text-blue-600">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-1.654 0-3 1.346-3 3H7.5c-.827 0-1.5.673-1.5 1.5v2.085c0 .408-.246.775-.623.923l-1.727.69a1.5 1.5 0 000 2.78l1.727.69c.377.149.623.515.623.923V16.5c0 .827.673 1.5 1.5 1.5H9c0 1.654 1.346 3 3 3s3-1.346 3-3h1.5c.827 0 1.5-.673 1.5-1.5v-2.085c0-.408.246-.775.623-.923l1.727-.69a1.5 1.5 0 000-2.78l-1.727-.69a1.001 1.001 0 01-.623-.923V4.5c0-.827-.673-1.5-1.5-1.5H15c0-1.654-1.346-3-3-3zm-1 15l-3-3 1.414-1.414L11 12.172l4.586-4.586L17 9l-6 6z" />
            </svg>
            Sponsored
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick Add to Cart — slides up on hover */}
        {!isOutOfStock && (
          <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0
            transition-transform duration-300 ease-out">
            <button
              onClick={handleAddToCart}
              className={`w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold
                transition-colors duration-200
                ${addedFlash
                  ? 'bg-green-500 text-white'
                  : inCart
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {addedFlash ? '✓ Added!' : inCart ? 'In Cart' : 'Add to Cart'}
            </button>
          </div>
        )}
      </div>

      {/* ══ Content area ══ */}
      <div className="flex flex-col flex-1 px-3 pt-2.5 pb-3 gap-1.5 cursor-pointer" onClick={handleNavigate}>

        {/* Name */}
        <h3 className="text-sm text-gray-800 font-semibold leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Rating row */}
        {rating > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${s <= Math.round(rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200 fill-gray-200'}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-500">
              {rating.toFixed(1)}
              {reviews > 0 && <span className="ml-0.5">({reviews})</span>}
            </span>
          </div>
        )}

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-base font-black text-orange-600 leading-none">
            Ksh {product.calculatedPrice.toLocaleString()}
          </span>
          {product.oldPrice > product.calculatedPrice && (
            <span className="text-[10px] line-through text-gray-400">
              Ksh {product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Trust pills row */}
        <div className="flex flex-wrap gap-1 mt-0.5">

          {/* Warranty */}
          {hasWarranty && (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold
              bg-green-50 text-green-700 border border-green-100 px-1.5 py-0.5 rounded-full">
              <ShieldCheck className="w-2.5 h-2.5" />
              {product.warranty}
            </span>
          )}

          {/* Verified / Condition */}
          {product.condition && (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold
              bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded-full">
              <BadgeCheck className="w-2.5 h-2.5" />
              {product.condition}
            </span>
          )}

          {/* Fulfillment */}
          {product.fulfillmentMode && (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold
              bg-orange-50 text-orange-700 border border-orange-100 px-1.5 py-0.5 rounded-full">
              <Clock className="w-2.5 h-2.5" />
              {product.fulfillmentMode}
            </span>
          )}
        </div>

        {/* Location */}
        {(product.county || product.town) && (
          <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
            <MapPin className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate">
              {product.town ? `${product.town}, ` : ''}{product.county}
            </span>
          </div>
        )}

        {/* Low stock urgency */}
        {isLowStock && (
          <div className="flex items-center gap-1 mt-0.5">
            <Zap className="w-3 h-3 text-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-red-500">
              Only {product.quantity} left!
            </span>
          </div>
        )}

        {/* Installment nudge */}
        {hasInstallment && (
          <div className="flex items-center gap-1 mt-0.5 bg-purple-50 border border-purple-100
            rounded-lg px-2 py-1">
            <CreditCard className="w-3 h-3 text-purple-500 shrink-0" />
            <span className="text-[9px] font-semibold text-purple-700 leading-tight">
              From Ksh {Math.ceil(
                (product.calculatedPrice * (1 - (product.installmentDepositPercent ?? 0) / 100))
                / (product.installmentMonths || 3)
              ).toLocaleString()}/mo
            </span>
          </div>
        )}

      </div>
    </div>
  );
}