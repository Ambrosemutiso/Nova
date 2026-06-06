'use client';

import { useRouter } from 'next/navigation';
import { CldImage } from 'next-cloudinary';
import type { ProductType } from '@/app/types/product';
import { useCart } from '@/app/context/CartContext';
import {
  MapPin, Star, ShieldCheck, Zap,
  CreditCard, ShoppingCart, BadgeCheck, Clock,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

interface ProductCardProps {
  product: ProductType;
  showSponsoredBadge?: boolean;
  redirectAllTo?: string;
  index?: number;
}

/* ── build the list of trust signals that have real data ── */
function useTrustSlots(product: ProductType) {
  const rating  = product.averageRating ?? product.rating ?? 0;
  const reviews = product.reviewCount   ?? 0;

  const slots: React.ReactNode[] = [];

  if (rating > 0)
    slots.push(
      <div key="rating" className="flex items-center gap-1">
        <div className="flex">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} className={`w-3 h-3 ${s <= Math.round(rating)
              ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
          ))}
        </div>
        <span className="text-[10px] text-gray-500 font-medium">
          {rating.toFixed(1)}{reviews > 0 && ` (${reviews})`}
        </span>
      </div>
    );

  if (product.warranty)
    slots.push(
      <div key="warranty" className="flex items-center gap-1">
        <ShieldCheck className="w-3 h-3 text-green-600 shrink-0" />
        <span className="text-[10px] font-semibold text-green-700">{product.warranty} warranty</span>
      </div>
    );

  if (product.condition)
    slots.push(
      <div key="condition" className="flex items-center gap-1">
        <BadgeCheck className="w-3 h-3 text-blue-600 shrink-0" />
        <span className="text-[10px] font-semibold text-blue-700">{product.condition}</span>
      </div>
    );

  if (product.fulfillmentMode)
    slots.push(
      <div key="fulfillment" className="flex items-center gap-1">
        <Clock className="w-3 h-3 text-orange-500 shrink-0" />
        <span className="text-[10px] font-semibold text-orange-700 capitalize">{product.fulfillmentMode}</span>
      </div>
    );

  if (product.county || product.town)
    slots.push(
      <div key="location" className="flex items-center gap-1">
        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
        <span className="text-[10px] text-gray-500 truncate">
          {product.town ? `${product.town}, ` : ''}{product.county}
        </span>
      </div>
    );

  if (product.quantity > 0 && product.quantity <= 5)
    slots.push(
      <div key="stock" className="flex items-center gap-1">
        <Zap className="w-3 h-3 text-red-500 shrink-0 animate-pulse" />
        <span className="text-[10px] font-bold text-red-500">Only {product.quantity} left!</span>
      </div>
    );

  if (product.installmentEnabled)
    slots.push(
      <div key="installment" className="flex items-center gap-1">
        <CreditCard className="w-3 h-3 text-purple-500 shrink-0" />
        <span className="text-[10px] font-semibold text-purple-700">
          From Ksh {Math.ceil(
            (product.calculatedPrice * (1 - (product.installmentDepositPercent ?? 0) / 100))
            / (product.installmentMonths || 3)
          ).toLocaleString()}/mo
        </span>
      </div>
    );

  return slots;
}

/* ════════════════════════════════════════════════════════════════ */

export default function ProductCard({
  product,
  showSponsoredBadge,
  redirectAllTo,
  index = 0,
}: ProductCardProps) {
  const router  = useRouter();
  const { addToCart, cartItems } = useCart();

  const [visible,     setVisible]     = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addedFlash,  setAddedFlash]  = useState(false);
  const [hovered,     setHovered]     = useState(false);

  /* rotating trust slot */
  const [slotIndex,   setSlotIndex]   = useState(0);
  const [slotVisible, setSlotVisible] = useState(true);

  const cardRef    = useRef<HTMLDivElement>(null);
  const trustSlots = useTrustSlots(product);

  /* ── entrance observer ── */
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── trust-slot rotation (pause on hover) ── */
  useEffect(() => {
    if (trustSlots.length <= 1 || hovered) return;

    const id = setInterval(() => {
      // fade out
      setSlotVisible(false);
      setTimeout(() => {
        setSlotIndex((p) => (p + 1) % trustSlots.length);
        setSlotVisible(true); // fade in
      }, 220); // matches transition duration below
    }, 2500);

    return () => clearInterval(id);
  }, [trustSlots.length, hovered]);

  /* ── helpers ── */
  const getPublicId = (url: string) => {
    const m = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
    return m ? m[1] : url;
  };

  const handleNavigate = useCallback(() =>
    router.push(redirectAllTo ?? `/product/${product.slug}`),
    [router, redirectAllTo, product.slug]
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product._id, name: product.name, images: product.images,
      brand: product.brand, model: product.model, county: product.county,
      town: product.town, weight: product.weight,
      calculatedPrice: product.calculatedPrice, quantity: 1,
      fulfillmentMode: product.fulfillmentMode, sellerId: product.sellerId,
      productId: product._id,
    });
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 1500);
  };

  /* ── derived ── */
  const inCart      = cartItems.some((i) => i.id === product._id);
  const isOutOfStock = product.quantity === 0;
  const discount    = product.oldPrice && product.oldPrice > product.calculatedPrice
    ? Math.round(((product.oldPrice - product.calculatedPrice) / product.oldPrice) * 100)
    : null;
  const staggerDelay = Math.min(index * 60, 400);

  /* ════════════ RENDER ════════════ */
  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col w-48 flex-shrink-0 bg-white rounded-2xl overflow-hidden
        border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-shadow duration-300"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.45s ease ${staggerDelay}ms, transform 0.45s ease ${staggerDelay}ms,
                     box-shadow 0.3s ease`,
      }}
    >
      {/* ══ IMAGE ══ */}
      <div
        className="relative overflow-hidden cursor-pointer bg-gray-50"
        style={{ height: '168px' }}
        onClick={handleNavigate}
      >
        {/* zoom wrapper */}
        <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
          <CldImage
            src={getPublicId(product.images[0])}
            alt={product.name}
            width="300"
            height="300"
            crop="fill"
            className={`w-full h-full object-cover transition-opacity duration-300
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            placeholder="blur"
            blurDataURL={`${getPublicId(product.images[0])}?blur=200`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        {/* skeleton shimmer */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100
            animate-[shimmer_1.4s_infinite_linear]"
            style={{ backgroundSize: '800px 100%' }}
          />
        )}

        {/* discount badge */}
        {discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black
            px-1.5 py-0.5 rounded-md shadow">
            -{discount}%
          </div>
        )}

        {/* sponsored badge */}
        {showSponsoredBadge && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-white/90 backdrop-blur-sm
            px-1.5 py-0.5 rounded-md shadow text-[9px] font-semibold text-blue-600">
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-1.654 0-3 1.346-3 3H7.5c-.827 0-1.5.673-1.5 1.5v2.085c0 .408-.246.775-.623.923l-1.727.69a1.5 1.5 0 000 2.78l1.727.69c.377.149.623.515.623.923V16.5c0 .827.673 1.5 1.5 1.5H9c0 1.654 1.346 3 3 3s3-1.346 3-3h1.5c.827 0 1.5-.673 1.5-1.5v-2.085c0-.408.246-.775.623-.923l1.727-.69a1.5 1.5 0 000-2.78l-1.727-.69a1.001 1.001 0 01-.623-.923V4.5c0-.827-.673-1.5-1.5-1.5H15c0-1.654-1.346-3-3-3zm-1 15l-3-3 1.414-1.414L11 12.172l4.586-4.586L17 9l-6 6z" />
            </svg>
            Ad
          </div>
        )}

        {/* out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-[10px] font-bold text-gray-500 bg-white px-2.5 py-1
              rounded-full border border-gray-200">
              Out of Stock
            </span>
          </div>
        )}

        {/* quick add — slides up on hover */}
        {!isOutOfStock && (
          <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0
            transition-transform duration-300 ease-out">
            <button
              onClick={handleAddToCart}
              className={`w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold
                transition-colors duration-150
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

      {/* ══ CONTENT (always-visible + rotating slot) ══ */}
      <div
        className="flex flex-col px-3 pt-2.5 pb-3 cursor-pointer"
        onClick={handleNavigate}
      >
        {/* name — always visible */}
        <h3 className="text-sm text-gray-800 font-semibold leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* price row — always visible */}
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <span className="text-sm font-black text-orange-600 leading-none">
            Ksh {product.calculatedPrice.toLocaleString()}
          </span>
          {product.oldPrice > product.calculatedPrice && (
            <span className="text-[10px] line-through text-gray-400">
              Ksh {product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* ── rotating trust slot ── fixed height so card doesn't jump */}
        {trustSlots.length > 0 && (
          <div className="mt-2 h-4 overflow-hidden">
            <div
              style={{
                opacity:    slotVisible ? 1 : 0,
                transform:  slotVisible ? 'translateY(0)' : 'translateY(4px)',
                transition: 'opacity 0.22s ease, transform 0.22s ease',
              }}
            >
              {trustSlots[slotIndex % trustSlots.length]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}