'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CldImage } from 'next-cloudinary';
import type { ProductType } from '@/app/types/product';
import { useCart } from '@/app/context/CartContext';
import { ShoppingCart, Zap } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

interface FlashProductCardProps {
  product: ProductType;
  showSponsoredBadge?: boolean;
  badge?: React.ReactNode;
  redirectAllTo?: string;
  index?: number;
  maxQuantity?: number; // original stock for progress bar; pass from parent if available
}

export default function FlashProductCard({
  product,
  showSponsoredBadge,
  badge,
  redirectAllTo,
  index = 0,
  maxQuantity,
}: FlashProductCardProps) {
  const router = useRouter();
  const { addToCart, cartItems } = useCart();

  const [visible,     setVisible]     = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addedFlash,  setAddedFlash]  = useState(false);
  const [stockAnim,   setStockAnim]   = useState(false);
  const [navigating,  setNavigating]  = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const targetHref = redirectAllTo ?? `/product/${product.slug}`;

  /* ── entrance observer ── */
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          setTimeout(() => setStockAnim(true), 400);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── helpers ── */
  const getPublicId = (url: string) => {
    const m = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
    return m ? m[1] : url;
  };

  /* ── fast navigation: instant visual feedback, Link prefetches in background ── */
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

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    handleAddToCart(e);
    router.push('/cart');
  };

  /* ── derived ── */
  const inCart       = cartItems.some((i) => i.id === product._id);
  const isOutOfStock = product.quantity === 0;
  const isLowStock   = product.quantity > 0 && product.quantity <= 5;
  const discount     = product.oldPrice && product.oldPrice > product.calculatedPrice
    ? Math.round(((product.oldPrice - product.calculatedPrice) / product.oldPrice) * 100)
    : null;

  const stockMax     = maxQuantity ?? Math.max(product.quantity, 20);
  const stockPct     = Math.min(100, Math.round((product.quantity / stockMax) * 100));
  const barColor     = stockPct <= 20 ? '#ef4444' : stockPct <= 50 ? '#f97316' : '#22c55e';

  const staggerDelay = Math.min(index * 70, 500);

  return (
    <Link
      href={targetHref}
      prefetch
      ref={cardRef as any}
      onClick={handleNavigate}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden
        border border-gray-100 shadow-sm hover:shadow-2xl
        transition-[box-shadow,opacity,transform] duration-300 cursor-pointer w-44"
      style={{
        opacity:    visible ? (navigating ? 0.6 : 1) : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.3s ease, transform 0.45s ease ${staggerDelay}ms, box-shadow 0.3s ease`,
      }}
    >

      {/* ══ IMAGE ══ */}
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: '1/1' }}>

        {/* zoom on hover */}
        <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
          <CldImage
            src={getPublicId(product.images[0])}
            alt={product.name}
            width={400}
            height={400}
            crop="fill"
            className={`w-full h-full object-cover transition-opacity duration-300
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            placeholder="blur"
            blurDataURL={`${getPublicId(product.images[0])}?blur=200`}
            onLoad={() => setImageLoaded(true)}
            loading={index < 4 ? 'eager' : 'lazy'}
          />
        </div>

        {/* shimmer skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100
            animate-[shimmer_1.4s_infinite_linear]"
            style={{ backgroundSize: '800px 100%' }}
          />
        )}

        {/* discount badge */}
        {discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[11px] font-black
            px-2 py-0.5 rounded-lg shadow-md">
            -{discount}%
          </div>
        )}

        {/* sponsored */}
        {showSponsoredBadge && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-blue-600
            text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow">
            Ad
          </div>
        )}

        {/* custom badge (e.g. "⭐ Deal") */}
        {badge && !showSponsoredBadge && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-black text-[9px] font-black
            px-1.5 py-0.5 rounded-md shadow">
            {badge}
          </div>
        )}

        {/* out-of-stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-500 bg-white border border-gray-200
              px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* ── Quick actions — slide up on hover ── */}
        {!isOutOfStock && (
          <div
            className="absolute bottom-0 inset-x-0 flex gap-0 translate-y-full
              group-hover:translate-y-0 transition-transform duration-300 ease-out"
          >
            <button
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-[11px] font-bold
                transition-colors duration-150
                ${addedFlash
                  ? 'bg-emerald-500 text-white'
                  : inCart
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {addedFlash ? '✓ Added' : inCart ? 'In Cart' : 'Add'}
            </button>
            <div className="w-px bg-white/30" />
            <button
              onClick={handleBuyNow}
              className="flex-1 flex items-center justify-center gap-1 py-2.5 text-[11px] font-bold
                bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-150"
            >
              <Zap className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              Buy Now
            </button>
          </div>
        )}
      </div>

      {/* ══ CONTENT ══ */}
      <div className="px-3 pt-2.5 pb-3 flex flex-col gap-1.5">

        {/* name */}
        <h3 className="text-sm text-gray-800 font-semibold leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* price */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-black text-red-600 leading-none">
            Ksh {product.calculatedPrice.toLocaleString()}
          </span>
          {product.oldPrice > product.calculatedPrice && (
            <span className="text-[10px] line-through text-gray-400">
              Ksh {product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* ── animated stock bar ── */}
        <div className="mt-1">
          <div className="flex items-center justify-between mb-1">
            {isLowStock ? (
              <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5 animate-pulse" />
                Only {product.quantity} left!
              </span>
            ) : isOutOfStock ? (
              <span className="text-[10px] font-semibold text-gray-400">Sold out</span>
            ) : (
              <span className="text-[10px] text-gray-500">{product.quantity} available</span>
            )}
            <span className="text-[10px] font-semibold" style={{ color: barColor }}>
              {stockPct}% left
            </span>
          </div>

          {/* track */}
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-[1200ms] ease-out"
              style={{
                width:      stockAnim ? `${stockPct}%` : '100%',
                backgroundColor: barColor,
              }}
            />
          </div>
        </div>

      </div>
    </Link>
  );
}