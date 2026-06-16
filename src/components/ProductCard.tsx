'use client';

import { useRouter } from 'next/navigation';
import { CldImage } from 'next-cloudinary';
import type { ProductType } from '@/app/types/product';
import { useCart } from '@/app/context/CartContext';
import {
  MapPin, Star, ShieldCheck, Zap,
  CreditCard, ShoppingCart, BadgeCheck, Clock, Truck,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';

interface ProductCardProps {
  product: ProductType;
  showSponsoredBadge?: boolean;
  redirectAllTo?: string;
  index?: number;
}

/* ── trust slot definitions, now richer / more "designed" ── */
function useTrustSlots(product: ProductType) {
  const rating  = product.averageRating ?? product.rating ?? 0;
  const reviews = product.reviewCount   ?? 0;

  return useMemo(() => {
    const slots: { node: React.ReactNode; tint: string }[] = [];

    if (rating > 0)
      slots.push({
        tint: 'bg-amber-50',
        node: (
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`w-3 h-3 ${s <= Math.round(rating)
                  ? 'text-amber-400 fill-amber-400' : 'text-amber-100 fill-amber-100'}`} />
              ))}
            </div>
            <span className="text-[10.5px] text-gray-600 font-semibold">
              {rating.toFixed(1)}{reviews > 0 && <span className="text-gray-400 font-normal"> · {reviews}</span>}
            </span>
          </div>
        ),
      });

    if (product.quantity > 0 && product.quantity <= 5)
      slots.push({
        tint: 'bg-red-50',
        node: (
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-red-500 shrink-0 animate-pulse" />
            <span className="text-[10.5px] font-bold text-red-600">Only {product.quantity} left</span>
          </div>
        ),
      });

    if (product.installmentEnabled)
      slots.push({
        tint: 'bg-violet-50',
        node: (
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-3 h-3 text-violet-500 shrink-0" />
            <span className="text-[10.5px] font-bold text-violet-700">
              Ksh {Math.ceil(
                (product.calculatedPrice * (1 - (product.installmentDepositPercent ?? 0) / 100))
                / (product.installmentMonths || 3)
              ).toLocaleString()}/mo
            </span>
          </div>
        ),
      });

    if (product.fulfillmentMode === 'company')
      slots.push({
        tint: 'bg-blue-50',
        node: (
          <div className="flex items-center gap-1.5">
            <Truck className="w-3 h-3 text-blue-500 shrink-0" />
            <span className="text-[10.5px] font-bold text-blue-700">Fast delivery</span>
          </div>
        ),
      });

    if (product.warranty)
      slots.push({
        tint: 'bg-emerald-50',
        node: (
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="text-[10.5px] font-bold text-emerald-700">{product.warranty} warranty</span>
          </div>
        ),
      });

    if (product.condition)
      slots.push({
        tint: 'bg-sky-50',
        node: (
          <div className="flex items-center gap-1.5">
            <BadgeCheck className="w-3 h-3 text-sky-600 shrink-0" />
            <span className="text-[10.5px] font-bold text-sky-700 capitalize">{product.condition.replace('_',' ')}</span>
          </div>
        ),
      });

    if (product.county || product.town)
      slots.push({
        tint: 'bg-gray-50',
        node: (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="text-[10.5px] text-gray-500 font-medium truncate">
              {product.town ? `${product.town}, ` : ''}{product.county}
            </span>
          </div>
        ),
      });

    return slots;
  }, [rating, reviews, product]);
}

/* ════════════════════════════════════════════════════════════════ */

export default function ProductCard({
  product,
  showSponsoredBadge,
  redirectAllTo,
  index = 0,
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart, cartItems } = useCart();

  const [visible,     setVisible]     = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addedFlash,  setAddedFlash]  = useState(false);
  const [hovered,     setHovered]     = useState(false);
  const [navigating,  setNavigating]  = useState(false);

  const [slotIndex,   setSlotIndex]   = useState(0);
  const [slotVisible, setSlotVisible] = useState(true);

  const cardRef     = useRef<HTMLDivElement>(null);
  const slotTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trustSlots  = useTrustSlots(product);

  const targetHref = redirectAllTo ?? `/product/${product.slug}`;

  /* entrance observer */
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

  /* trust-slot rotation — single interval, cleared properly, paused on hover */
  useEffect(() => {
    if (trustSlots.length <= 1 || hovered) {
      if (slotTimerRef.current) clearInterval(slotTimerRef.current);
      return;
    }
    slotTimerRef.current = setInterval(() => {
      setSlotVisible(false);
      setTimeout(() => {
        setSlotIndex((p) => (p + 1) % trustSlots.length);
        setSlotVisible(true);
      }, 200);
    }, 3000);
    return () => { if (slotTimerRef.current) clearInterval(slotTimerRef.current); };
  }, [trustSlots.length, hovered]);

  const getPublicId = (url: string) => {
    const m = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
    return m ? m[1] : url;
  };

  /* ── fast navigation: instant visual feedback + router.push, no awaited work blocking it ── */
  const handleNavigate = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setNavigating(true);
    router.push(targetHref);
  }, [router, targetHref]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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

  const inCart       = cartItems.some((i) => i.id === product._id);
  const isOutOfStock = product.quantity === 0;
  const discount     = product.oldPrice && product.oldPrice > product.calculatedPrice
    ? Math.round(((product.oldPrice - product.calculatedPrice) / product.oldPrice) * 100)
    : null;
  const staggerDelay = Math.min(index * 50, 350);

  return (
    <Link
      href={targetHref}
      prefetch
      ref={cardRef as any}
      onClick={handleNavigate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col w-56 flex-shrink-0 bg-white rounded-3xl overflow-hidden
        border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1
        transition-[box-shadow,transform] duration-300"
      style={{
        opacity:    visible ? (navigating ? 0.6 : 1) : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.3s ease, transform 0.45s ease ${staggerDelay}ms, box-shadow 0.3s ease`,
      }}
    >
      {/* ══ IMAGE — taller, more breathing room, no squeeze ══ */}
      <div className="relative overflow-hidden bg-gray-50 aspect-[4/5]">
        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]">
          <CldImage
            src={getPublicId(product.images[0])}
            alt={product.name}
            width="420"
            height="525"
            crop="fill"
            gravity="auto"
            className={`w-full h-full object-cover transition-opacity duration-300
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            placeholder="blur"
            blurDataURL={`${getPublicId(product.images[0])}?blur=200`}
            onLoad={() => setImageLoaded(true)}
            loading={index < 4 ? 'eager' : 'lazy'}
          />
        </div>

        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100
            animate-[shimmer_1.4s_infinite_linear]"
            style={{ backgroundSize: '800px 100%' }}
          />
        )}

        {discount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-black
            px-2 py-1 rounded-lg shadow-md">
            -{discount}%
          </div>
        )}

        {showSponsoredBadge && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm
            px-2 py-1 rounded-lg shadow text-[10px] font-semibold text-blue-600">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-1.654 0-3 1.346-3 3H7.5c-.827 0-1.5.673-1.5 1.5v2.085c0 .408-.246.775-.623.923l-1.727.69a1.5 1.5 0 000 2.78l1.727.69c.377.149.623.515.623.923V16.5c0 .827.673 1.5 1.5 1.5H9c0 1.654 1.346 3 3 3s3-1.346 3-3h1.5c.827 0 1.5-.673 1.5-1.5v-2.085c0-.408.246-.775.623-.923l1.727-.69a1.5 1.5 0 000-2.78l-1.727-.69a1.001 1.001 0 01-.623-.923V4.5c0-.827-.673-1.5-1.5-1.5H15c0-1.654-1.346-3-3-3zm-1 15l-3-3 1.414-1.414L11 12.172l4.586-4.586L17 9l-6 6z" />
            </svg>
            Ad
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
            <span className="text-[11px] font-bold text-gray-600 bg-white px-3 py-1.5
              rounded-full border border-gray-200 shadow-sm">
              Out of Stock
            </span>
          </div>
        )}

        {!isOutOfStock && (
          <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0
            transition-transform duration-300 ease-out">
            <button
              onClick={handleAddToCart}
              className={`w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold
                transition-colors duration-150
                ${addedFlash
                  ? 'bg-emerald-500 text-white'
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

      {/* ══ CONTENT — more vertical room, clearer hierarchy ══ */}
      <div className="flex flex-col px-4 pt-3.5 pb-4 gap-2">
        <h3 className="text-[13.5px] text-gray-800 font-semibold leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2">
          <span className="text-base font-black text-orange-600 leading-none">
            Ksh {product.calculatedPrice.toLocaleString()}
          </span>
          {product.oldPrice > product.calculatedPrice && (
            <span className="text-[11px] line-through text-gray-400">
              Ksh {product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* ── Premium trust slot: pill-style with tinted background ── */}
        {trustSlots.length > 0 && (
          <div className="relative h-[26px] mt-0.5">
            <div
              className={`absolute inset-0 flex items-center px-2.5 rounded-full ${trustSlots[slotIndex % trustSlots.length].tint} w-fit max-w-full`}
              style={{
                opacity:    slotVisible ? 1 : 0,
                transform:  slotVisible ? 'translateY(0) scale(1)' : 'translateY(3px) scale(0.98)',
                transition: 'opacity 0.2s ease, transform 0.2s ease',
              }}
            >
              {trustSlots[slotIndex % trustSlots.length].node}
            </div>

            {/* progress dots — shows there's more trust info rotating */}
            {trustSlots.length > 1 && (
              <div className="absolute -bottom-0.5 right-0 flex items-center gap-0.5">
                {trustSlots.map((_, i) => (
                  <span
                    key={i}
                    className={`block rounded-full transition-all duration-300 ${
                      i === slotIndex % trustSlots.length
                        ? 'w-2.5 h-1 bg-gray-300'
                        : 'w-1 h-1 bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}