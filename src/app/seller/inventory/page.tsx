'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Package, Edit2, Trash2, Eye,
  TrendingUp, AlertTriangle, CheckCircle2, Loader2,
  LayoutGrid, List, Filter, X, ChevronDown, ImageOff
} from 'lucide-react';
import type { ProductType } from '@/app/types/product';

type ViewMode = 'grid' | 'list';
type SortKey  = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'stock_low';

const CONDITION_LABELS: Record<string, string> = {
  brand_new:   'New',
  used:        'Used',
  refurbished: 'Refurbished',
};

const STOCK_THRESHOLD = 5;

export default function InventoryPage() {
  const [products, setProducts]         = useState<ProductType[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [sortKey, setSortKey]           = useState<SortKey>('newest');
  const [viewMode, setViewMode]         = useState<ViewMode>('grid');
  const [deleteTarget, setDeleteTarget] = useState<ProductType | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const sellerData = localStorage.getItem('sellerUser');
    if (!sellerData) return;
    const { _id: sellerId } = JSON.parse(sellerData);

    const fetch_ = async () => {
      try {
        const res  = await fetch(`/api/seller/products?sellerId=${sellerId}`);
        const json = await res.json();
        setProducts(json.success && Array.isArray(json.data) ? json.data : []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res  = await fetch(`/api/seller/products/${deleteTarget._id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('Product removed from inventory.');
        setProducts(prev => prev.filter(p => p._id !== deleteTarget._id));
        setDeleteTarget(null);
      } else {
        toast.error(json.message || 'Delete failed.');
      }
    } catch {
      toast.error('An error occurred.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const categories  = [...new Set(products.map(p => p.category))].filter(Boolean);
  const totalValue  = products.reduce((s, p) => s + p.calculatedPrice * p.quantity, 0);
  const lowStock    = products.filter(p => p.quantity <= STOCK_THRESHOLD).length;
  const totalViews  = products.reduce((s, p) => s + (p.views || 0), 0);

  const filtered = products
    .filter(p => {
      const q = search.toLowerCase();
      return (
        (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) &&
        (!categoryFilter || p.category === categoryFilter)
      );
    })
    .sort((a, b) => {
      if (sortKey === 'newest')     return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortKey === 'oldest')     return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortKey === 'price_desc') return b.calculatedPrice - a.calculatedPrice;
      if (sortKey === 'price_asc')  return a.calculatedPrice - b.calculatedPrice;
      if (sortKey === 'stock_low')  return a.quantity - b.quantity;
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#f8f7f4] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">

        {/* ── Page header ────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.15em] mb-1">Seller Hub</p>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
              Inventory<span className="text-orange-500">.</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1.5">
              {loading ? 'Loading…' : `${products.length} product${products.length !== 1 ? 's' : ''} listed`}
            </p>
          </div>
          <Link
            href="/seller/products/add"
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-lg shadow-orange-200 transition-all"
          >
            <Plus size={15} /> Add Product
          </Link>
        </div>

        {/* ── Stats strip ────────────────────────────────────────────────── */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total Products', value: products.length, icon: Package,       color: 'from-blue-500 to-indigo-500' },
              { label: 'Inventory Value', value: `Ksh ${(totalValue/1000).toFixed(1)}k`, icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
              { label: 'Low Stock',      value: lowStock,        icon: AlertTriangle, color: 'from-amber-500 to-orange-500' },
              { label: 'Total Views',    value: totalViews.toLocaleString(), icon: Eye, color: 'from-violet-500 to-purple-500' },
            ].map(({ label, value, icon: Icon, color }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                  <p className="text-lg font-black text-gray-800 leading-tight">{value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Search + filters ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all cursor-pointer"
            >
              <option value="">All categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value as SortKey)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all cursor-pointer"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="stock_low">Stock: Low → High</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(['grid', 'list'] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${viewMode === v ? 'bg-white shadow-sm text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {v === 'grid' ? <LayoutGrid size={14} /> : <List size={14} />}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
              <Loader2 size={20} className="text-orange-500 animate-spin" />
            </div>
            <p className="text-sm text-gray-400">Loading inventory…</p>
          </div>

        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Package size={24} className="text-gray-300" />
            </div>
            <h3 className="text-base font-bold text-gray-600 mb-1">
              {search || categoryFilter ? 'No products match your filters' : 'No products yet'}
            </h3>
            <p className="text-sm text-gray-400 mb-5">
              {search || categoryFilter ? 'Try a different search or clear filters.' : 'Add your first product to get started.'}
            </p>
            {!search && !categoryFilter && (
              <Link href="/seller/products/add" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition">
                <Plus size={14} /> Add first product
              </Link>
            )}
          </div>

        ) : viewMode === 'grid' ? (
          /* ── Grid view ────────────────────────────────────────────────── */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Image */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageOff size={20} className="text-gray-300" />
                    </div>
                  )}
                  {/* Stock badge */}
                  {product.quantity <= STOCK_THRESHOLD && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                      Low stock
                    </span>
                  )}
                  {product.quantity === 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                      Out of stock
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight mb-1">{product.name}</p>
                  <p className="text-[10px] text-gray-400 mb-2 truncate">{product.category}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-black text-orange-600">Ksh {product.calculatedPrice.toLocaleString()}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${product.quantity > STOCK_THRESHOLD ? 'bg-emerald-50 text-emerald-600' : product.quantity > 0 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                      {product.quantity} left
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <Link
                      href={`/seller/inventory/editproduct/${product._id}`}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 rounded-xl text-xs font-semibold text-gray-600 transition-colors"
                    >
                      <Edit2 size={11} /> Edit
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(product)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-xl text-xs font-semibold text-gray-600 transition-colors"
                    >
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        ) : (
          /* ── List view ────────────────────────────────────────────────── */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Product','Category','Price','Stock','Condition','Listed','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((product, i) => (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-orange-50/30 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><ImageOff size={12} className="text-gray-300" /></div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate max-w-[160px]">{product.name}</p>
                            <p className="text-[10px] text-gray-400 truncate max-w-[160px]">{product.subcategory}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{product.category}</td>
                      <td className="px-4 py-3 font-bold text-orange-600 whitespace-nowrap">Ksh {product.calculatedPrice.toLocaleString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${product.quantity > STOCK_THRESHOLD ? 'bg-emerald-50 text-emerald-600' : product.quantity > 0 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                          {product.quantity === 0 ? 'Out of stock' : `${product.quantity} units`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {CONDITION_LABELS[product.condition] || product.condition || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(product.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/seller/inventory/editproduct/${product._id}`}
                            className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-orange-500 transition-colors px-2 py-1 rounded-lg hover:bg-orange-50"
                          >
                            <Edit2 size={12} /> Edit
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Delete confirmation modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(5,7,12,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 340, damping: 36 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-sm p-6"
            >
              <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <h2 className="text-base font-black text-gray-900 mb-1">Delete product?</h2>
              <p className="text-sm text-gray-500 mb-1 leading-relaxed">
                You're about to permanently remove:
              </p>
              <p className="text-sm font-semibold text-gray-800 bg-gray-50 rounded-xl px-3 py-2 mb-5 truncate">
                {deleteTarget.name}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition shadow-md shadow-red-200 disabled:opacity-50"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  {deleting ? 'Removing…' : 'Yes, delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}