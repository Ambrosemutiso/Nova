'use client';

import { useEffect, useMemo, useState } from 'react';
import InstallmentProductCard from '@/components/InstallmentsProductCard';
import type { ProductType } from '@/app/types/product';
import {
  Search, ChevronDown, ShieldCheck, Zap, Clock, Wallet,
  Package, X, Sparkles, CreditCard, TrendingUp,
} from 'lucide-react';

type SortKey = 'popular' | 'price_low' | 'price_high' | 'shortest_plan';

const trustItems = [
  { icon: <ShieldCheck className="w-4 h-4" />, label: 'No hidden fees' },
  { icon: <Zap className="w-4 h-4" />,          label: 'Instant approval' },
  { icon: <Clock className="w-4 h-4" />,        label: 'Flexible terms' },
  { icon: <CreditCard className="w-4 h-4" />,   label: 'Secure payments' },
];

export default function InstallmentsPage() {
  const [items, setItems]       = useState<ProductType[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [sortKey, setSortKey]   = useState<SortKey>('popular');
  const [maxMonthly, setMaxMonthly] = useState('');

  useEffect(() => {
    const fetchInstallments = async () => {
      try {
        const res  = await fetch('/api/products/installments');
        const data = await res.json();
        setItems(data.products || []);
      } catch (err) {
        console.error('Failed to fetch installment products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInstallments();
  }, []);

  /* ── derived stats for hero ── */
  const totalProducts = items.length;
  const categories     = useMemo(
    () => [...new Set(items.map((p) => p.category).filter(Boolean))],
    [items]
  );

  /* ── monthly payment helper, mirrors InstallmentProductCard logic ── */
  const getMonthly = (p: ProductType) => {
    const price    = p.calculatedPrice ?? 0;
    const months   = p.installmentMonths || 6;
    const depPct   = p.installmentDepositPercent ?? 20;
    const deposit  = Math.ceil(price * (depPct / 100));
    return Math.round((price - deposit) / months);
  };

  /* ── filter + sort ── */
  const filtered = items
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => !maxMonthly || getMonthly(p) <= Number(maxMonthly))
    .sort((a, b) => {
      if (sortKey === 'price_low')      return (a.calculatedPrice ?? 0) - (b.calculatedPrice ?? 0);
      if (sortKey === 'price_high')     return (b.calculatedPrice ?? 0) - (a.calculatedPrice ?? 0);
      if (sortKey === 'shortest_plan')  return (a.installmentMonths ?? 6) - (b.installmentMonths ?? 6);
      return 0; // 'popular' — relies on API's default order
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12 md:pl-[17rem]">

        {/* ══════════ HERO ══════════ */}
        <div
          className="relative rounded-3xl overflow-hidden mb-6"
          style={{ background: 'linear-gradient(135deg, #1c1c1e 0%, #2d1a00 50%, #7c2d12 100%)' }}
        >
          <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-red-500/10 blur-2xl pointer-events-none" />

          <div className="relative px-6 py-8 sm:py-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">Lipa Mdogo Mdogo</span>
            </div>
            <h1 className="text-white font-black text-2xl sm:text-3xl leading-tight mb-2">
              Own it today.<br />Pay a little at a time.
            </h1>
            <p className="text-gray-400 text-sm max-w-md mb-6 leading-relaxed">
              Browse thousands of products with flexible installment plans — small deposit, easy monthly payments, zero stress.
            </p>

            {/* stats row */}
            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
              <div className="flex flex-col items-center gap-1 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 min-w-[100px]">
                <Wallet className="w-4 h-4 text-yellow-300" />
                <p className="text-white font-black text-lg leading-none">{totalProducts}+</p>
                <p className="text-white/70 text-[10px] text-center leading-tight">products available</p>
              </div>
              <div className="flex flex-col items-center gap-1 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 min-w-[100px]">
                <TrendingUp className="w-4 h-4 text-yellow-300" />
                <p className="text-white font-black text-lg leading-none">{categories.length || '—'}</p>
                <p className="text-white/70 text-[10px] text-center leading-tight">categories covered</p>
              </div>
              <div className="flex flex-col items-center gap-1 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 min-w-[100px]">
                <Zap className="w-4 h-4 text-yellow-300" />
                <p className="text-white font-black text-lg leading-none">Instant</p>
                <p className="text-white/70 text-[10px] text-center leading-tight">approval, no waiting</p>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ TRUST STRIP ══════════ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
            {trustItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 px-4 py-3.5">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                  {item.icon}
                </div>
                <span className="text-xs font-semibold text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════ FILTER BAR ══════════ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 mb-6 flex flex-wrap gap-2 items-center">

          {/* search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm
                focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* max monthly payment */}
          <div className="relative w-40">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">Ksh</span>
            <input
              type="number"
              value={maxMonthly}
              onChange={(e) => setMaxMonthly(e.target.value)}
              placeholder="Max /month"
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm
                focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
          </div>

          {/* sort */}
          <div className="relative">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2.5
                text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 transition cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="price_low">Price: Low → High</option>
              <option value="price_high">Price: High → Low</option>
              <option value="shortest_plan">Shortest Plan First</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* ══════════ RESULT COUNT ══════════ */}
        {!loading && (
          <p className="text-xs text-gray-400 mb-4 px-1">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''} available on installments
          </p>
        )}

        {/* ══════════ CONTENT ══════════ */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
                <div className="aspect-square bg-gray-100 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-4/5" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-3/5" />
                  <div className="h-10 bg-gray-100 rounded-xl animate-pulse mt-2" />
                  <div className="h-8 bg-gray-100 rounded-xl animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-base font-bold text-gray-700">
              {items.length === 0 ? 'No installment products yet' : 'No products match your filters'}
            </h2>
            <p className="text-sm text-gray-400 mt-1 mb-4">
              {items.length === 0
                ? 'Check back soon — new products are added regularly.'
                : 'Try a different search or adjust your filters.'}
            </p>
            {items.length > 0 && (
              <button
                onClick={() => { setSearch(''); setMaxMonthly(''); }}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold
                  px-5 py-2.5 rounded-xl transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product, i) => (
              <InstallmentProductCard key={product._id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}