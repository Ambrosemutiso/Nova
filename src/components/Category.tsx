'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';
import {
  ChevronRight, SlidersHorizontal, X, Star, ShoppingCart,
  Heart, ChevronDown, ArrowUpDown, Package, Check,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Clock, ShieldCheck,
} from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import { addToWishlist, isInWishlist } from '@/lib/wishlist';
import type { ProductType } from '@/app/types/product';

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════ */
const LIMIT = 12;

const SORT_OPTIONS = [
  { value: 'name-asc',   label: 'Name (A–Z)'        },
  { value: 'name-desc',  label: 'Name (Z–A)'        },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

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
            className="fixed inset-0 bg-black/50 z-[9999]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
           className="fixed bottom-0 inset-x-0 z-[99999] rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
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

/* ── styled dropdown ── */
function Dropdown({
  value, onChange, placeholder, children,
}: {
  value: string; onChange: (v: string) => void;
  placeholder: string; children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full bg-white border border-gray-200 rounded-xl
          px-3 py-2.5 pr-8 text-sm text-gray-800 font-medium
          focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
          transition cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

/* ── active filter pill ── */
function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200
      text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-orange-900 transition">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
   PRODUCT CARD
══════════════════════════════════════════════════════════════ */
interface ProductCardProps {
  product: ProductType;
  inCart: boolean;
  cartQty: number;
  onAdd: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  index: number;
}

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
{product.quantity > 0 ? (
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
        ) : (
          inCart ? (
            <span className="mt-1 text-[10px] text-gray-400 flex items-center gap-0.5">
              <Check className="w-3 h-3 text-green-500" /> In Cart
            </span>
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
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function CategoryPage() {
  const params       = useParams<{ categorySlug?: string }>();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { addToCart, cartItems, increaseQuantity, decreaseQuantity } = useCart();

  const categorySlug = params.categorySlug ?? 'default';
  const categoryName = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const page     = Number(searchParams.get('page') ?? 1);
  const sort     = searchParams.get('sort')     ?? 'name-asc';
  const brand    = searchParams.get('brand')    ?? '';
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';

  const [products,   setProducts]   = useState<ProductType[]>([]);
  const [brands,     setBrands]     = useState<string[]>([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [showFilter, setShowFilter] = useState(false);

  /* local price inputs (only applied on blur / Enter) */
  const [minInput, setMinInput] = useState(minPrice);
  const [maxInput, setMaxInput] = useState(maxPrice);

  const totalPages = Math.ceil(total / LIMIT);

  useEffect(() => {
    setLoading(true);
    fetchProducts(categorySlug, page, sort, brand, minPrice, maxPrice)
      .then(({ products, total, brands }) => {
        const lastPage = Math.max(1, Math.ceil(total / LIMIT));
        if (page > lastPage) {
          router.push(`/category/${categorySlug}?page=${lastPage}&sort=${sort}`);
          return;
        }
        setProducts(products);
        setTotal(total);
        setBrands(brands ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categorySlug, page, sort, brand, minPrice, maxPrice, router]);

  const updateQuery = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    value ? p.set(key, value) : p.delete(key);
    p.set('page', '1');
    router.push(`/category/${categorySlug}?${p}`);
  };

  const applyPriceRange = () => {
    const p = new URLSearchParams(searchParams.toString());
    minInput ? p.set('minPrice', minInput) : p.delete('minPrice');
    maxInput ? p.set('maxPrice', maxInput) : p.delete('maxPrice');
    p.set('page', '1');
    router.push(`/category/${categorySlug}?${p}`);
  };

  const clearAll = () => {
    setMinInput(''); setMaxInput('');
    router.push(`/category/${categorySlug}?sort=${sort}`);
  };

  const activeFilters = [
    brand    && { key: 'brand',    label: `Brand: ${brand}`,       onRemove: () => updateQuery('brand', '') },
    minPrice && { key: 'minPrice', label: `Min: Ksh ${minPrice}`,  onRemove: () => { setMinInput(''); updateQuery('minPrice', ''); } },
    maxPrice && { key: 'maxPrice', label: `Max: Ksh ${maxPrice}`,  onRemove: () => { setMaxInput(''); updateQuery('maxPrice', ''); } },
  ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[];

  const sortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label ?? 'Sort';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 pt-28 pb-12">

        {/* ── breadcrumb ── */}
        <nav className="flex items-center text-xs text-gray-400 mb-5 gap-1 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <Link href="/shop" className="hover:text-gray-600 transition">Shop</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-gray-700 font-semibold capitalize">{categoryName}</span>
        </nav>

        {/* ── page title + result count ── */}
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <h1 className="text-xl font-black text-gray-900 capitalize">{categoryName}</h1>
            {!loading && (
              <p className="text-xs text-gray-400 mt-0.5">
                {total.toLocaleString()} product{total !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            FILTER BAR
        ══════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">

          {/* top row */}
          <div className="flex flex-wrap items-center gap-3 px-4 py-3">

            {/* filter toggle (mobile) */}
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold
                transition-all duration-200
                ${showFilter || activeFilters.length > 0
                  ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-200'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-orange-300'
                }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilters.length > 0 && (
                <span className="bg-white text-orange-600 text-[10px] font-black w-5 h-5 rounded-full
                  flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {/* brand selector — always visible on md+ */}
            {brands.length > 0 && (
              <div className="hidden md:block w-44">
                <Dropdown value={brand} onChange={(v) => updateQuery('brand', v)} placeholder="All Brands">
                  {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                </Dropdown>
              </div>
            )}

            {/* price inputs — always visible on md+ */}
            <div className="hidden md:flex items-center gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">Ksh</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minInput}
                  onChange={(e) => setMinInput(e.target.value)}
                  onBlur={applyPriceRange}
                  onKeyDown={(e) => e.key === 'Enter' && applyPriceRange()}
                  className="pl-10 pr-3 py-2.5 w-28 bg-white border border-gray-200 rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
              </div>
              <span className="text-gray-300 text-sm">—</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">Ksh</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxInput}
                  onChange={(e) => setMaxInput(e.target.value)}
                  onBlur={applyPriceRange}
                  onKeyDown={(e) => e.key === 'Enter' && applyPriceRange()}
                  className="pl-10 pr-3 py-2.5 w-28 bg-white border border-gray-200 rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* sort — right-aligned */}
            <div className="ml-auto flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="w-44">
                <Dropdown value={sort} onChange={(v) => updateQuery('sort', v)} placeholder="Sort">
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Dropdown>
              </div>
            </div>
          </div>

          {/* expandable panel (mobile + overflow) */}
          {showFilter && (
            <div className="border-t border-gray-100 px-4 py-4 space-y-4">
              {/* brand — mobile */}
              {brands.length > 0 && (
                <div className="md:hidden">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Brand</label>
                  <Dropdown value={brand} onChange={(v) => updateQuery('brand', v)} placeholder="All Brands">
                    {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                  </Dropdown>
                </div>
              )}

              {/* brand pills (desktop) */}
              {brands.length > 0 && (
                <div className="hidden md:block">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Brand</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateQuery('brand', '')}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition
                        ${!brand ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'}`}
                    >
                      All
                    </button>
                    {brands.map((b) => (
                      <button
                        key={b}
                        onClick={() => updateQuery('brand', b)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition
                          ${brand === b ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'}`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* price — mobile */}
              <div className="md:hidden">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Price Range</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Ksh</span>
                    <input type="number" placeholder="Min" value={minInput}
                      onChange={(e) => setMinInput(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm
                        focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
                  </div>
                  <span className="text-gray-300">—</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Ksh</span>
                    <input type="number" placeholder="Max" value={maxInput}
                      onChange={(e) => setMaxInput(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm
                        focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
                  </div>
                </div>
                <button onClick={applyPriceRange}
                  className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold
                    py-2.5 rounded-xl transition active:scale-[0.98]">
                  Apply Price
                </button>
              </div>

              {/* clear all */}
              {activeFilters.length > 0 && (
                <button onClick={clearAll}
                  className="text-xs text-red-400 hover:text-red-600 font-semibold flex items-center gap-1 transition">
                  <X className="w-3.5 h-3.5" /> Clear all filters
                </button>
              )}
            </div>
          )}

          {/* active filter pills */}
          {activeFilters.length > 0 && (
            <div className="border-t border-gray-50 px-4 py-2.5 flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active:</span>
              {activeFilters.map((f) => (
                <FilterPill key={f.key} label={f.label} onRemove={f.onRemove} />
              ))}
              <button onClick={clearAll}
                className="text-[10px] text-red-400 hover:text-red-600 font-semibold ml-auto transition">
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* ── products ── */}
        {loading ? (
          <SkeletonGrid />
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-base font-bold text-gray-700">No products found</h2>
            <p className="text-sm text-gray-400 mt-1 mb-4">Try adjusting your filters or search terms.</p>
            <button onClick={clearAll}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold
                px-5 py-2.5 rounded-xl transition">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, i) => {
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

        {/* ── pagination ── */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-10 flex-wrap">
            {page > 1 && (
              <Link
                href={`/category/${categorySlug}?page=${page - 1}&sort=${sort}&brand=${brand}&minPrice=${minPrice}&maxPrice=${maxPrice}`}
                className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center
                  text-gray-600 hover:border-orange-400 hover:text-orange-600 transition shadow-sm"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </Link>
            )}

            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const isActive = p === page;
              const isNear = Math.abs(p - page) <= 2 || p === 1 || p === totalPages;
              if (!isNear) return p === 2 || p === totalPages - 1
                ? <span key={p} className="text-gray-400 text-sm px-1">…</span>
                : null;
              return (
                <Link
                  key={p}
                  href={`/category/${categorySlug}?page=${p}&sort=${sort}&brand=${brand}&minPrice=${minPrice}&maxPrice=${maxPrice}`}
                  className={`w-9 h-9 rounded-xl text-sm font-bold flex items-center justify-center transition
                    ${isActive
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-600'
                    }`}
                >
                  {p}
                </Link>
              );
            })}

            {page < totalPages && (
              <Link
                href={`/category/${categorySlug}?page=${page + 1}&sort=${sort}&brand=${brand}&minPrice=${minPrice}&maxPrice=${maxPrice}`}
                className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center
                  text-gray-600 hover:border-orange-400 hover:text-orange-600 transition shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}