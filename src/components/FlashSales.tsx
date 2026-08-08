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

import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Clock, ShieldCheck,
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

/* ══════════════════════════════════════════════════════════════
   SOLD-OUT CONSENT DRAWER
   Shown when a buyer tries to add an item the system has marked
   quantity: 0. It's common for sellers to be slow updating stock,
   so we let the buyer proceed — but only after they've seen and
   accepted what that means (seller gets notified, refund if it
   truly can't be fulfilled, possible delay).
══════════════════════════════════════════════════════════════ */
function SoldOutDrawer({
  open, onClose, onConfirm, productName,
}: {
  open: boolean; onClose: () => void; onConfirm: () => void; productName: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [agreed, setAgreed]   = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => { if (!open) setAgreed(false); }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-[100]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[101] mx-auto w-full max-w-lg
              bg-white rounded-t-3xl shadow-2xl"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            {/* grab handle */}
            <div className="flex justify-center pt-3">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            <div className="px-5 pt-4 pb-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">This item shows as out of stock</h3>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{productName}</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="mt-4 text-xs text-gray-500 leading-relaxed">
                Sellers sometimes fall behind on updating their stock counts, so this item may
                actually still be available. You can add it to your cart — here's what happens next:
              </p>

              <ul className="mt-3 space-y-3">
                <li className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                    <ShoppingCart className="w-3.5 h-3.5 text-orange-500" />
                  </span>
                  <span className="text-xs text-gray-600 leading-relaxed">
                    We'll notify the seller right away to confirm availability and update the listing.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                  </span>
                  <span className="text-xs text-gray-600 leading-relaxed">
                    Your order may take a little longer to process while the seller confirms stock.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                  </span>
                  <span className="text-xs text-gray-600 leading-relaxed">
                    If the seller genuinely can't fulfill it, you'll be refunded in full — no action needed from you.
                  </span>
                </li>
              </ul>

              <label className="mt-5 flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-orange-500"
                />
                <span className="text-xs text-gray-600 leading-relaxed">
                  I understand and want to proceed with adding this item to my cart.
                </span>
              </label>

              <div className="mt-5 flex items-center gap-2.5">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600
                    hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { if (agreed) onConfirm(); }}
                  disabled={!agreed}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition
                    bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400
                    disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
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
  const [showSoldOutDrawer, setShowSoldOutDrawer] = useState(false);
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
{/* ── wishlist / sold-out ribbon ── */}
      {product.quantity > 0 ? (
        <button
          onClick={() => { addToWishlist(product); setWished(!wished); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow
            flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-10"
        >
          <Heart className={`w-4 h-4 transition-colors ${wished ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
        </button>
      ) : (
        <div
          className="absolute -right-10 top-4 w-36 rotate-45 origin-center
            bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-black
            uppercase tracking-wider text-center py-1 shadow-md z-10 select-none"
        >
          Sold Out
        </div>
      )}
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
            <>
              <button
                onClick={() => setShowSoldOutDrawer(true)}
                className="mt-1 w-full flex items-center justify-center gap-1.5
                  bg-white border border-amber-300 text-amber-700 hover:bg-amber-50
                  active:scale-[0.98] text-xs font-bold py-2.5 rounded-xl transition"
              >
                <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
              </button>
              <SoldOutDrawer
                open={showSoldOutDrawer}
                onClose={() => setShowSoldOutDrawer(false)}
                onConfirm={() => { onAdd(); setShowSoldOutDrawer(false); }}
                productName={product.name}
              />
            </>
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