//Cannot redeclare block-scoped variable 'SORT_OPTIONS'.
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { CldImage } from 'next-cloudinary';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProductType } from '@/app/types/product';
import RecentlyViewed from './RecentlyViewed';
import TopPicksForYou from './TopPicksForYou';
import SuggestedForYou from './SuggestedForYou';
import SponsoredProducts from './SponsoredProducts';
import {
  Search, SlidersHorizontal, ChevronRight, ChevronLeft,
  Star, MapPin, ShoppingCart, Zap, Heart, X, Check,
  TrendingUp, Package, ArrowUpDown,
} from 'lucide-react';

/* ─── Design tokens ────────────────────────────────────────── */
const T = {
  ink:      '#111110',
  canvas:   '#F7F5F1',
  paper:    '#FFFFFF',
  line:     '#EAE6DD',
  muted:    '#8C8780',
  orange:   '#F97316',
  orangeDk: '#C2410C',
  red:      '#DC2626',
};

/* ══════════════════════════════════════════════════════════════
   INBUILT SEARCH PRODUCT CARD
   Horizontal on mobile (thumbnail left + info right), grid on
   desktop. Badge row: discount pill + low-stock tag. Single CTA.
══════════════════════════════════════════════════════════════ */
function SearchProductCard({ product }: { product: ProductType }) {
  const [wishlisted, setWishlisted] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
  const [added, setAdded] = useState(false);
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.calculatedPrice) / product.oldPrice) * 100)
    : 0;
  const isLowStock  = product.quantity > 0 && product.quantity <= 5;
  const isOutStock  = product.quantity === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    // wire your addToCart here
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(w => !w);
  };

const getPublicId = (url?: string) => {
  if (!url) return '';
  const m = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
  return m?.[1] ?? '';
};
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block rounded-2xl overflow-hidden transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
      style={{ background: T.paper, border: `1px solid ${T.line}` }}
    >
      {/* — thumbnail — */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.images?.[0] ? (
          <CldImage
            src={getPublicId(product.images?.[0]) || 'sample'}
            alt={product.name}
            width={300} height={300} crop="fill"
            className={`object-cover w-full h-full transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={32} style={{ color: T.line }} />
          </div>
        )}

        {/* top-left badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full" style={{ background: T.red }}>
              -{discount}%
            </span>
          )}
          {isLowStock && !isOutStock && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: T.orange, color: '#fff' }}>
              {product.quantity} left
            </span>
          )}
        </div>

        {/* wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition"
          style={{ background: 'rgba(255,255,255,0.85)' }}
          aria-label="Add to wishlist"
        >
          <Heart
            size={13}
            style={{
              color: wishlisted ? T.red : T.muted,
              fill: wishlisted ? T.red : 'transparent',
              transition: 'all 0.15s',
            }}
          />
        </button>

        {/* add to cart – only if in stock */}
        {!isOutStock && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-2 inset-x-2 flex items-center justify-center gap-1.5 text-white text-xs font-semibold
              py-2 rounded-xl transition opacity-0 group-hover:opacity-100 active:scale-95"
            style={{ background: added ? '#16a34a' : T.ink }}
            aria-label="Add to cart"
          >
            {added ? <Check size={13} /> : <ShoppingCart size={13} />}
            {added ? 'Added!' : 'Add to Cart'}
          </button>
        )}
      </div>

      {/* — info — */}
      <div className="px-3 pt-3 pb-3.5">
        {/* category */}
        {product.category && (
          <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: T.orange }}>
            {product.category}
          </p>
        )}

        {/* name */}
        <p className="text-sm font-semibold leading-snug line-clamp-2 mb-2" style={{ color: T.ink }}>
          {product.name}
        </p>

        {/* rating */}
        {product.averageRating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star size={11} style={{ color: '#FBBF24', fill: '#FBBF24' }} />
            <span className="text-[11px] font-semibold" style={{ color: T.ink }}>
              {product.averageRating.toFixed(1)}
            </span>
            {product.reviewCount > 0 && (
              <span className="text-[11px]" style={{ color: T.muted }}>
                ({product.reviewCount})
              </span>
            )}
          </div>
        )}

        {/* price row */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-base font-bold tabular-nums" style={{ color: T.orange }}>
              Ksh {product.calculatedPrice.toLocaleString()}
            </p>
            {product.oldPrice && (
              <p className="text-[11px] line-through" style={{ color: T.muted }}>
                Ksh {product.oldPrice.toLocaleString()}
              </p>
            )}
          </div>
          {/* location */}
          {product.county && (
            <div className="flex items-center gap-0.5" style={{ color: T.muted }}>
              <MapPin size={10} />
              <span className="text-[10px]">{product.town || product.county}</span>
            </div>
          )}
        </div>

        {/* out of stock label */}
        {isOutStock && (
          <p className="mt-2 text-[11px] font-semibold" style={{ color: T.red }}>Out of stock</p>
        )}
      </div>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════════
   SKELETON CARD — used during fetch
══════════════════════════════════════════════════════════════ */
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: T.paper, border: `1px solid ${T.line}` }}>
      <div className="aspect-square" style={{ background: T.canvas }} />
      <div className="px-3 py-3.5 space-y-2">
        <div className="h-2.5 w-1/3 rounded-full" style={{ background: T.line }} />
        <div className="h-3 w-4/5 rounded-full" style={{ background: T.line }} />
        <div className="h-3 w-3/5 rounded-full" style={{ background: T.line }} />
        <div className="h-4 w-2/5 rounded-full mt-3" style={{ background: T.line }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ACTIVE FILTER PILL
══════════════════════════════════════════════════════════════ */
function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div
      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
      style={{ background: `${T.orange}14`, color: T.orangeDk, border: `1px solid ${T.orange}33` }}
    >
      {label}
      <button onClick={onRemove} className="hover:opacity-70 transition">
        <X size={11} />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FILTER DRAWER (slides up from bottom on mobile)
══════════════════════════════════════════════════════════════ */
interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  availableCategories: string[];
  category: string; setCategory: (v: string) => void;
  sort: string; setSort: (v: string) => void;
  minPrice: string; setMinPrice: (v: string) => void;
  maxPrice: string; setMaxPrice: (v: string) => void;
  onClear: () => void;
  resultCount: number;
}

// ← place this BEFORE function FilterDrawer(...)
const SORT_OPTIONS = [
  { value: '',           label: 'Relevance' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name',       label: 'Name A–Z' },
];

function FilterDrawer({
  open, onClose, availableCategories, category, setCategory,
  sort, setSort, minPrice, setMinPrice, maxPrice, setMaxPrice,
  onClear, resultCount,
}: FilterDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
          {/* drawer */}
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-[999999999999999999999] rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
            style={{ background: T.paper, maxHeight: '85vh' }}
          >
            {/* handle */}
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ background: T.line }} />
            </div>
            <div className="flex items-center justify-between px-5 pb-4 shrink-0" style={{ borderBottom: `1px solid ${T.line}` }}>
              <h2 className="text-base font-bold" style={{ color: T.ink }}>Filters & Sort</h2>
              <button onClick={onClear} className="text-xs font-semibold" style={{ color: T.orange }}>Clear all</button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

              {/* sort */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: T.muted }}>Sort by</p>
                <div className="grid grid-cols-2 gap-2">
                  {SORT_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      onClick={() => setSort(o.value)}
                      className="py-2.5 rounded-xl text-sm font-semibold transition"
                      style={
                        sort === o.value
                          ? { background: T.ink, color: '#fff' }
                          : { background: T.canvas, color: T.ink, border: `1px solid ${T.line}` }
                      }
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* category */}
              {availableCategories.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: T.muted }}>Category</p>
                  <div className="flex flex-wrap gap-2">
                    {['All', ...availableCategories].map(c => (
                      <button
                        key={c}
                        onClick={() => setCategory(c === 'All' ? '' : c)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition"
                        style={
                          (c === 'All' && !category) || category === c
                            ? { background: T.orange, color: '#fff' }
                            : { background: T.canvas, color: T.ink, border: `1px solid ${T.line}` }
                        }
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* price range */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: T.muted }}>Price range (Ksh)</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { placeholder: 'Min', value: minPrice, onChange: setMinPrice },
                    { placeholder: 'Max', value: maxPrice, onChange: setMaxPrice },
                  ].map((f, i) => (
                    <input
                      key={i}
                      type="number"
                      placeholder={f.placeholder}
                      value={f.value}
                      onChange={e => f.onChange(e.target.value)}
                      className="rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2"
                      style={{
                        border: `1px solid ${T.line}`,
                        background: T.canvas,
                        color: T.ink,
                        ['--tw-ring-color' as any]: `${T.orange}55`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* apply CTA */}
            <div className="shrink-0 px-5 py-4" style={{ borderTop: `1px solid ${T.line}` }}>
              <button
                onClick={onClose}
                className="w-full text-white font-bold py-3.5 rounded-2xl transition"
                style={{ background: T.orange }}
              >
                Show {resultCount} result{resultCount !== 1 ? 's' : ''}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN SEARCH RESULTS PAGE
══════════════════════════════════════════════════════════════ */
const ITEMS_PER_PAGE = 12;

export default function SearchResults() {
  const searchParams   = useSearchParams();
  const query          = searchParams.get('q') || '';
  const [results,      setResults]      = useState<ProductType[]>([]);
  const [filtered,     setFiltered]     = useState<ProductType[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [category,     setCategory]     = useState('');
  const [availableCats, setAvailableCats] = useState<string[]>([]);
  const [sort,         setSort]         = useState('');
  const [minPrice,     setMinPrice]     = useState('');
  const [maxPrice,     setMaxPrice]     = useState('');
  const [page,         setPage]         = useState(1);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  /* ── fetch ── */
  useEffect(() => {
    if (!query.trim()) return;
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        const products = data.products || [];
        setResults(products);
        const cats = [...new Set(products.map((p: ProductType) => p.category).filter(Boolean))] as string[];
        setAvailableCats(cats);
      } catch (err) { console.error('Search error:', err); }
      finally { setLoading(false); }
    };
    fetchResults();
  }, [query]);

  /* ── filter + sort ── */
  useEffect(() => {
    let data = [...results];
    if (category && category !== 'All')
      data = data.filter(p => p.category?.toLowerCase() === category.toLowerCase());
    if (minPrice)
      data = data.filter(p => p.calculatedPrice >= parseFloat(minPrice));
    if (maxPrice)
      data = data.filter(p => p.calculatedPrice <= parseFloat(maxPrice));
    if (sort === 'price-asc')  data.sort((a, b) => a.calculatedPrice - b.calculatedPrice);
    if (sort === 'price-desc') data.sort((a, b) => b.calculatedPrice - a.calculatedPrice);
    if (sort === 'name')       data.sort((a, b) => a.name.localeCompare(b.name));
    setFiltered(data);
    setPage(1);
  }, [results, category, sort, minPrice, maxPrice]);

  const totalPages    = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const displayedItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const clearFilters = () => {
    setCategory(''); setSort(''); setMinPrice(''); setMaxPrice('');
  };

  const hasActiveFilters = !!(category || sort || minPrice || maxPrice);
  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth' });

  const changePage = (n: number) => { setPage(n); scrollTop(); };

  /* ── active filter pills ── */
  const activePills = [
    ...(category ? [{ label: category, clear: () => setCategory('') }] : []),
    ...(sort ? [{ label: SORT_OPTIONS.find(o => o.value === sort)?.label || sort, clear: () => setSort('') }] : []),
    ...(minPrice ? [{ label: `Min Ksh ${minPrice}`, clear: () => setMinPrice('') }] : []),
    ...(maxPrice ? [{ label: `Max Ksh ${maxPrice}`, clear: () => setMaxPrice('') }] : []),
  ];

  return (
    <div className="min-h-screen" style={{ background: T.canvas }} ref={topRef}>
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-20">

        {/* ── breadcrumb ── */}
        <nav className="flex items-center gap-1.5 text-xs mb-5" style={{ color: T.muted }}>
          <span>Home</span>
          <ChevronRight size={12} />
          <span>Search</span>
          <ChevronRight size={12} />
          <span className="font-semibold" style={{ color: T.ink }}>"{query}"</span>
        </nav>

        {/* ── header ── */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Search size={16} style={{ color: T.orange }} />
              <h1 className="text-xl font-bold" style={{ color: T.ink, fontFamily: "'Outfit', sans-serif" }}>
                {query}
              </h1>
            </div>
            {!loading && (
              <p className="text-sm" style={{ color: T.muted }}>
                {filtered.length} result{filtered.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>

          {/* filter button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition"
            style={{
              background: hasActiveFilters ? T.ink : T.paper,
              color: hasActiveFilters ? '#fff' : T.ink,
              border: `1px solid ${hasActiveFilters ? T.ink : T.line}`,
            }}
          >
            <SlidersHorizontal size={14} />
            Filters
            {hasActiveFilters && (
              <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: T.orange, color: '#fff' }}>
                {activePills.length}
              </span>
            )}
          </button>
        </div>

        {/* ── active filter pills ── */}
        {activePills.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {activePills.map((p, i) => (
              <FilterPill key={i} label={p.label} onRemove={p.clear} />
            ))}
            <button
              onClick={clearFilters}
              className="text-xs font-semibold px-3 py-1.5 rounded-full transition"
              style={{ color: T.muted, border: `1px solid ${T.line}` }}
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── skeleton / results ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState query={query} onClearFilters={clearFilters} hasFilters={hasActiveFilters} />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {displayedItems.map(product => (
                <SearchProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* ── pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => changePage(page - 1)}
                  disabled={page === 1}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition disabled:opacity-30"
                  style={{ background: T.paper, border: `1px solid ${T.line}`, color: T.ink }}
                >
                  <ChevronLeft size={15} />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                    .reduce<(number | '…')[]>((acc, n, i, arr) => {
                      if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('…');
                      acc.push(n);
                      return acc;
                    }, [])
                    .map((n, i) =>
                      n === '…' ? (
                        <span key={`ellipsis-${i}`} className="w-9 text-center text-sm" style={{ color: T.muted }}>…</span>
                      ) : (
                        <button
                          key={n}
                          onClick={() => changePage(n as number)}
                          className="w-9 h-9 rounded-xl text-sm font-semibold transition"
                          style={
                            page === n
                              ? { background: T.ink, color: '#fff' }
                              : { background: T.paper, color: T.ink, border: `1px solid ${T.line}` }
                          }
                        >
                          {n}
                        </button>
                      )
                    )}
                </div>

                <button
                  onClick={() => changePage(page + 1)}
                  disabled={page === totalPages}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition disabled:opacity-30"
                  style={{ background: T.paper, border: `1px solid ${T.line}`, color: T.ink }}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}

        {/* ── discovery sections ── */}
        <div className="mt-16 space-y-8">
          <SponsoredProducts />
          <RecentlyViewed />
          <TopPicksForYou />
          <SuggestedForYou />
        </div>
      </div>

      {/* ── filter drawer ── */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        availableCategories={availableCats}
        category={category} setCategory={setCategory}
        sort={sort} setSort={setSort}
        minPrice={minPrice} setMinPrice={setMinPrice}
        maxPrice={maxPrice} setMaxPrice={setMaxPrice}
        onClear={clearFilters}
        resultCount={filtered.length}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&display=swap');
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════════════════════════════ */
function EmptyState({ query, onClearFilters, hasFilters }: { query: string; onClearFilters: () => void; hasFilters: boolean }) {
  return (
    <div className="text-center py-20">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: T.paper, border: `1px solid ${T.line}` }}
      >
        <Search size={28} style={{ color: T.line }} />
      </div>
      <p className="text-base font-bold mb-1.5" style={{ color: T.ink }}>
        {hasFilters ? 'No results match your filters' : `No results for "${query}"`}
      </p>
      <p className="text-sm mb-6" style={{ color: T.muted }}>
        {hasFilters
          ? 'Try removing some filters to see more products.'
          : 'Double-check your spelling or try a broader search term.'}
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition"
          style={{ background: T.orange }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}