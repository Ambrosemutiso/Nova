'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CldImage } from 'next-cloudinary';
import { Star, ShoppingCart, Heart, Package, Check } from 'lucide-react';
import type { ProductType } from '@/app/types/product';
import { useCart } from '@/app/context/CartContext';
import { addToWishlist, isInWishlist } from '@/lib/wishlist';

interface ProductCardProps {
  product: ProductType;
  showSponsoredBadge?: boolean;
  redirectAllTo?: string;
  index?: number;
}

const getPublicId = (url?: string) => {
  if (!url) return '';
  const m = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
  return m?.[1] ?? url;
};

/* ── star rating row — same look as the category page card ── */
function StarRow({ rating = 0 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${
            s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

/* ── stock bar — same look as the category page card ── */
function StockBar({ quantity = 0 }: { quantity?: number }) {
  const pct   = Math.min((quantity / 50) * 100, 100);
  const color = pct <= 20 ? '#ef4444' : pct <= 50 ? '#f97316' : '#22c55e';
  const isLow = quantity > 0 && quantity <= 5;

  return (
    <div>
      {isLow && (
        <p className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mb-0.5">
          <Package className="w-3 h-3" /> Only {quantity} left!
        </p>
      )}
      <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function ProductCard({ product, showSponsoredBadge, redirectAllTo, index = 0 }: ProductCardProps) {
  const router = useRouter();
  const { addToCart, cartItems, increaseQuantity, decreaseQuantity } = useCart();

  const [visible, setVisible]     = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [wished, setWished]       = useState(() => isInWishlist(product._id));
  const ref = useRef<HTMLDivElement>(null);

  // scroll-in fade, same technique as the category grid so cards inside
  // horizontal carousels animate in instead of just popping into place
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const cartItem = cartItems.find((c) => c.id === product._id);
  const inCart   = !!cartItem;
  const cartQty  = cartItem?.quantity ?? 0;

  const discount = product.oldPrice && product.oldPrice > product.calculatedPrice
    ? Math.round(((product.oldPrice - product.calculatedPrice) / product.oldPrice) * 100)
    : null;

  const goToProduct = () => (redirectAllTo ? router.push(redirectAllTo) : router.push(`/product/${product.slug}`));

  const handleAdd = () => {
    addToCart({
      id: product._id, productId: product._id,
      name: product.name, images: product.images ?? [],
      brand: product.brand, model: product.model, quantity: 1,
      calculatedPrice: product.calculatedPrice,
      fulfillmentMode: product.fulfillmentMode,
      sellerId: product.sellerId, county: product.county,
      town: product.town, weight: product.weight,
    });
  };

  return (
    <div
      ref={ref}
      className="group relative w-52 flex-shrink-0 flex flex-col bg-white rounded-2xl border border-gray-100
        shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.4s ease ${Math.min(index * 50, 300)}ms,
                     transform 0.4s ease ${Math.min(index * 50, 300)}ms,
                     box-shadow 0.3s ease, translate 0.3s ease`,
      }}
    >
      {/* ── sponsored badge ── */}
      {showSponsoredBadge && (
        <div className="absolute top-0 left-0 flex items-center gap-1 bg-white px-2 py-1 rounded-br-xl z-10 text-xs font-semibold shadow-sm">
          <svg className="w-4 h-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-1.654 0-3 1.346-3 3H7.5c-.827 0-1.5.673-1.5 1.5v2.085c0 .408-.246.775-.623.923l-1.727.69a1.5 1.5 0 000 2.78l1.727.69c.377.149.623.515.623.923V16.5c0 .827.673 1.5 1.5 1.5H9c0 1.654 1.346 3 3 3s3-1.346 3-3h1.5c.827 0 1.5-.673 1.5-1.5v-2.085c0-.408.246-.775.623-.923l1.727-.69a1.5 1.5 0 000-2.78l-1.727-.69a1.001 1.001 0 01-.623-.923V4.5c0-.827-.673-1.5-1.5-1.5H15c0-1.654-1.346-3-3-3zm-1 15l-3-3 1.414-1.414L11 12.172l4.586-4.586L17 9l-6 6z" />
          </svg>
          <span className="text-blue-600">Sponsored</span>
        </div>
      )}

      {/* ── image ── */}
      <div onClick={goToProduct} className="relative block aspect-square bg-gray-50 overflow-hidden cursor-pointer">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
        )}
        <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
          <CldImage
            src={getPublicId(product.images?.[0]) || 'sample'}
            alt={product.name}
            width={300}
            height={300}
            crop="fill"
            className={`object-cover w-full h-full transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
          />
        </div>

        {discount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg shadow">
            -{discount}%
          </span>
        )}

        {product.quantity === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* ── wishlist ── */}
      <button
        onClick={(e) => { e.stopPropagation(); addToWishlist(product); setWished(!wished); }}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow
          flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      >
        <Heart className={`w-4 h-4 transition-colors ${wished ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
      </button>

      {/* ── content ── */}
      <div className="flex flex-col flex-1 px-3 pt-2.5 pb-3 gap-1.5">
        <h3
          onClick={goToProduct}
          className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-orange-600 transition-colors cursor-pointer"
        >
          {product.name}
        </h3>

        <StarRow rating={product.averageRating ?? product.rating ?? 0} />

        <StockBar quantity={product.quantity} />

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-base font-black text-orange-600 leading-none">
            Ksh {product.calculatedPrice.toLocaleString()}
          </span>
          {product.oldPrice > product.calculatedPrice && (
            <span className="text-[10px] line-through text-gray-400">
              Ksh {product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>

        {product.quantity > 0 && (
          inCart ? (
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={(e) => { e.stopPropagation(); decreaseQuantity(product._id); }}
                className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 font-bold hover:bg-orange-200 active:scale-95 transition flex items-center justify-center"
              >
                −
              </button>
              <span className="text-sm font-bold text-gray-900 w-5 text-center tabular-nums">{cartQty}</span>
              <button
                onClick={(e) => { e.stopPropagation(); increaseQuantity(product._id); }}
                className="w-7 h-7 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-600 active:scale-95 transition flex items-center justify-center shadow-sm"
              >
                +
              </button>
              <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-0.5">
                <Check className="w-3 h-3 text-green-500" /> In Cart
              </span>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); handleAdd(); }}
              className="mt-1 w-full flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600
                active:scale-[0.98] text-white text-xs font-bold py-2.5 rounded-xl transition shadow-sm shadow-orange-200"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
            </button>
          )
        )}
      </div>
    </div>
  );
}