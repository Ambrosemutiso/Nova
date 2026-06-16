'use client';

import { useEffect, useState, useRef } from 'react';
import type { ProductType } from '@/app/types/product';
import { toast } from 'react-toastify';
import FlashProductCard from './FlashSaleProductCard';
import { Zap, ChevronRight, RefreshCw } from 'lucide-react';

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

      {/* ══ PRODUCT ROW — horizontal scroll ══ */}
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
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <RefreshCw className="w-8 h-8 mb-2 animate-spin" />
          <p className="text-sm">No products in this category</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory scroll-smooth">
          {filtered.map((product, i) => (
            <div key={product._id} className="snap-start flex-shrink-0">
              <FlashProductCard
                product={product}
                index={i}
              />
            </div>
          ))}

          {/* see all card — last item in the scroll row */}
          <button className="flex-shrink-0 w-44 flex flex-col items-center justify-center gap-2
            rounded-2xl border-2 border-dashed border-red-200 bg-red-50/40 hover:bg-red-50
            text-red-500 font-bold text-sm transition-all duration-200 snap-start">
            See All Deals
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}