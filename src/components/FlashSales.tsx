'use client';

import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';
import {
  ChevronRight, SlidersHorizontal, X, Star, ShoppingCart,
  Heart, ChevronDown, ArrowUpDown, Package, Check, Zap, RefreshCw
} from 'lucide-react';

import { useCart } from '@/app/context/CartContext';
import { addToWishlist, isInWishlist } from '@/lib/wishlist';
import type { ProductType } from '@/app/types/product';

const LIMIT = 200;
const FLASH_SALE_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

/* ── flip-digit display ── */
function Digit({ value }: { value: string }) {
  const [display, setDisplay] = useState(value);
  const [flip,    setFlip]    = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (value !== prev.current) {
      setFlip(true);
      const t = setTimeout(() => { setDisplay(value); setFlip(false); prev.current = value; }, 200);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <span
      className="inline-flex items-center justify-center w-9 h-10 rounded-lg tabular-nums
        font-black text-xl text-white bg-white/20 backdrop-blur-sm shadow-inner"
      style={{
        transform:  flip ? 'scaleY(0.6)' : 'scaleY(1)',
        transition: 'transform 0.18s ease',
      }}
    >
      {display}
    </span>
  );
}

function pad(n: number) { return String(n).padStart(2, '0'); }

/* ══════════════════════════════════════════════════════════════
   TYPES / FETCH
══════════════════════════════════════════════════════════════ */
type FetchResponse = { total: number; products: ProductType[]; brands: string[] };

const fetchProducts = async (
  slug: string, page: number, sort: string,
  brand: string, minPrice: string, maxPrice: string,
): Promise<FetchResponse> => {
  const q = new URLSearchParams({ page: String(page), limit: String(LIMIT), sort });
  if (brand)    q.set('brand',    brand);
  if (minPrice) q.set('minPrice', minPrice);
  if (maxPrice) q.set('maxPrice', maxPrice);
  const res = await fetch(`/api/products/category/${slug}?${q}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

const getPublicId = (url?: string) => {
  if (!url) return '';
  const m = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
  return m?.[1] ?? '';
};

/* ══════════════════════════════════════════════════════════════
   SMALL HELPERS
══════════════════════════════════════════════════════════════ */
function StarRow({ rating = 0 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= Math.round(rating)
            ? 'text-amber-400 fill-amber-400'
            : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
    </div>
  );
}

function StockBar({ quantity = 0 }: { quantity?: number }) {
  const pct   = Math.min((quantity / 50) * 100, 100);
  const color  = pct <= 20 ? '#ef4444' : pct <= 50 ? '#f97316' : '#22c55e';
  const isLow  = quantity > 0 && quantity <= 5;

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

//productcard interface
interface ProductCardProps {
  product: ProductType;
  inCart: boolean;
  cartQty: number;
  onAdd: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  index: number;
}

//Flashsale ProductCard Set up
function ProductCard({ product, inCart, cartQty, onAdd, onIncrease, onDecrease, index }: ProductCardProps) {
  const [visible, setVisible]   = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [wished, setWished]     = useState(() => isInWishlist(product._id));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const discount = product.oldPrice && product.oldPrice > product.calculatedPrice
    ? Math.round(((product.oldPrice - product.calculatedPrice) / product.oldPrice) * 100)
    : null;

  return (
    <div
      ref={ref}
      className="group relative flex flex-col bg-white rounded-2xl border border-gray-100
        shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.4s ease ${Math.min(index * 50, 300)}ms,
                     transform 0.4s ease ${Math.min(index * 50, 300)}ms,
                     box-shadow 0.3s ease, translate 0.3s ease`,
      }}
    >
      {/* ── image ── */}
      <Link href={`/product/${product.slug}`} className="relative block aspect-square bg-gray-50 overflow-hidden">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100
            animate-pulse" />
        )}
        <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
          <CldImage
            src={getPublicId(product.images?.[0]) || 'sample'}
            alt={product.name}
            width={300} height={300} crop="fill"
            className={`object-cover w-full h-full transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
          />
        </div>

        {/* discount badge */}
        {discount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black
            px-1.5 py-0.5 rounded-lg shadow">
            -{discount}%
          </span>
        )}

        {/* out of stock */}
        {product.quantity === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-500 bg-white border border-gray-200
              px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* ── wishlist ── */}
      <button
        onClick={() => { addToWishlist(product); setWished(!wished); }}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow
          flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      >
        <Heart className={`w-4 h-4 transition-colors ${wished ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
      </button>

      {/* ── content ── */}
      <div className="flex flex-col flex-1 px-3 pt-2.5 pb-3 gap-1.5">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug
            hover:text-orange-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <StarRow rating={product.averageRating ?? product.rating ?? 0} />

        <StockBar quantity={product.quantity} />

        {/* price */}
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

        {/* cart controls */}
        {product.quantity > 0 && (
          inCart ? (
            <div className="flex items-center gap-2 mt-1">
              <button onClick={onDecrease}
                className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 font-bold
                  hover:bg-orange-200 active:scale-95 transition flex items-center justify-center">
                −
              </button>
              <span className="text-sm font-bold text-gray-900 w-5 text-center tabular-nums">
                {cartQty}
              </span>
              <button onClick={onIncrease}
                className="w-7 h-7 rounded-lg bg-orange-500 text-white font-bold
                  hover:bg-orange-600 active:scale-95 transition flex items-center justify-center shadow-sm">
                +
              </button>
              <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-0.5">
                <Check className="w-3 h-3 text-green-500" /> In Cart
              </span>
            </div>
          ) : (
            <button
              onClick={onAdd}
              className="mt-1 w-full flex items-center justify-center gap-1.5
                bg-orange-500 hover:bg-orange-600 active:scale-[0.98]
                text-white text-xs font-bold py-2.5 rounded-xl transition shadow-sm shadow-orange-200"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
            </button>
          )
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SKELETON GRID
══════════════════════════════════════════════════════════════ */
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="aspect-square bg-gray-100 animate-pulse" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-100 rounded animate-pulse w-4/5" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-3/5" />
            <div className="h-2 bg-gray-100 rounded animate-pulse w-full" />
            <div className="h-7 bg-gray-100 rounded-xl animate-pulse mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function FlashSales() {
  const [flashProducts,     setFlashProducts]     = useState<ProductType[]>([]);
  const [categories,        setCategories]        = useState<string[]>([]);
  const [selectedCategory,  setSelectedCategory]  = useState<string>('All');
  const [time,              setTime]              = useState({ h: 0, m: 0, s: 0 });
  const [progressPct,       setProgressPct]       = useState(0);
  const [loading,           setLoading]           = useState(true);
  const [headerVisible,     setHeaderVisible]     = useState(false);

    const params       = useParams<{ categorySlug?: string }>();
    const searchParams = useSearchParams();
    const router       = useRouter();
    const { addToCart, cartItems, increaseQuantity, decreaseQuantity } = useCart();

  const saleEndRef      = useRef<Date | null>(null);
  const headerRef       = useRef<HTMLDivElement>(null);

  /* ── header entrance observer ── */
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setHeaderVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const initSaleEnd = () => {
    saleEndRef.current = new Date(Date.now() + FLASH_SALE_DURATION_MS);
  };

  const fetchFlashSales = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/products/flash-sales');
      const data = await res.json();
      const products: ProductType[] = data.products || [];
      setFlashProducts(products);
      setSelectedCategory('All');
      setCategories([...new Set(products.map((p) => p.category))] as string[]);
    } catch (err) {
      console.error('Flash sales fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initSaleEnd();
    fetchFlashSales();

    const timer = setInterval(() => {
      const diff = Math.max(0, (saleEndRef.current?.getTime() ?? 0) - Date.now());

      if (diff === 0) {
        initSaleEnd();
        fetchFlashSales();
        toast.success('🔥 New flash sale started!');
      }

      setTime({
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
      });
      setProgressPct(
        saleEndRef.current
          ? ((FLASH_SALE_DURATION_MS - diff) / FLASH_SALE_DURATION_MS) * 100
          : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const filtered = selectedCategory === 'All'
    ? flashProducts
    : flashProducts.filter((p) => p.category === selectedCategory);

  if (!loading && flashProducts.length === 0) return null;

  return (
    <div>
      {/* ══ HEADER BANNER ══ */}
      <div
        ref={headerRef}
        className="relative rounded-2xl overflow-hidden mb-5"
        style={{
          background: 'linear-gradient(135deg, #111827 0%, #1f2937 40%, #7f1d1d 100%)',
          opacity:    headerVisible ? 1 : 0,
          transform:  headerVisible ? 'translateY(0)' : 'translateY(-12px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        {/* decorative glows */}
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-10 w-36 h-36 rounded-full bg-orange-500/20 blur-2xl pointer-events-none" />

        <div className="relative px-5 py-5">

          {/* top row: title + countdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            {/* left: title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/30 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-black text-xl tracking-tight">FLASH SALE</span>
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5
                    rounded-full animate-pulse">
                    LIVE
                  </span>
                </div>
                <p className="text-gray-400 text-xs mt-0.5">
                  Up to 60% off — refreshes every 3 hours
                </p>
              </div>
            </div>

            {/* right: countdown */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs">Ends in</span>
              <div className="flex items-center gap-1">
                <Digit value={pad(time.h)} />
                <span className="text-white font-black text-lg">:</span>
                <Digit value={pad(time.m)} />
                <span className="text-white font-black text-lg">:</span>
                <Digit value={pad(time.s)} />
              </div>
            </div>
          </div>

          {/* progress bar — "time burning" */}
          <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #f97316, #ef4444)',
              }}
            />
          </div>

          {/* category pills */}
          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto mt-4 pb-0.5 no-scrollbar">
              {['All', ...categories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200
                    ${selectedCategory === cat
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
        {/* ── products ── */}
          {loading ? (
            /* skeleton row */
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-44 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
              <div className="aspect-square bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100
                animate-[shimmer_1.4s_infinite_linear]"
                style={{ backgroundSize: '800px 100%' }}
              />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-100 rounded animate-pulse w-4/5" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-3/5" />
                <div className="h-2 bg-gray-100 rounded animate-pulse w-full mt-1" />
              </div>
            </div>
          ))}
        </div>
                  ) : filtered.length === 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                      <h2 className="text-base font-bold text-gray-700">No products found in this category</h2>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filtered.map((product, i) => {
                        const cartItem = cartItems.find((c) => c.id === product._id);
                        return (
                          <ProductCard
                            key={product._id}
                            product={product}
                            index={i}
                            inCart={!!cartItem}
                            cartQty={cartItem?.quantity ?? 0}
                            onAdd={() => {
                              addToCart({
                                id: product._id, productId: product._id,
                                name: product.name, images: product.images ?? [],
                                brand: product.brand, model: product.model, quantity: 1,
                                calculatedPrice: product.calculatedPrice,
                                fulfillmentMode: product.fulfillmentMode,
                                sellerId: product.sellerId, county: product.county,
                                town: product.town, weight: product.weight,
                              });
                            }}
                            onIncrease={() => increaseQuantity(product._id)}
                            onDecrease={() => decreaseQuantity(product._id)}
                          />
                        );
                      })}
          </div>
      )}
    </div>
  );
}