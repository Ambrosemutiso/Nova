'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Save, Package, Tag, Truck, Info,
  AlertCircle, CheckCircle2, Loader2, Eye,
  ImageOff, Star, MapPin
} from 'lucide-react';
import type { ProductType } from '@/app/types/product';
import { categoryTree } from '@/lib/productCategories';

type Category = keyof typeof categoryTree;

const inputCls = `w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800
  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all`;

const selectCls = `${inputCls} cursor-pointer appearance-none`;

// ── Reusable wrappers (same as AddProduct) ────────────────────────────────────
function Section({
  icon: Icon, title, badge, children,
}: {
  icon: React.ElementType; title: string; badge?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
          <Icon size={15} className="text-orange-500" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-800">{title}</h2>
          {badge && <p className="text-[10px] text-gray-400 font-medium mt-0.5">{badge}</p>}
        </div>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label, hint, required, error, children,
}: {
  label: string; hint?: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-xs font-semibold text-gray-600">
        {label}
        {required && <span className="text-orange-500">*</span>}
        {hint && <span className="ml-1 text-[10px] font-normal text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{hint}</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-500">
          <AlertCircle size={10} /> {error}
        </p>
      )}
    </div>
  );
}

export default function EditProductPage() {
  const { id }    = useParams();
  const router    = useRouter();

  const [product, setProduct]         = useState<ProductType | null>(null);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [productTypes, setProductTypes]   = useState<string[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [priceError, setPriceError]   = useState('');
  const [saved, setSaved]             = useState(false);

  // ── Fetch product ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const fetch_ = async () => {
      try {
        const res  = await fetch(`/api/seller/products/${id}`);
        const data = await res.json();
        if (data.success) setProduct(data.product);
        else toast.error('Product not found.');
      } catch {
        toast.error('Failed to load product.');
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [id]);

  // ── Category cascade ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!product?.category) return;
    setSubcategories(Object.keys(categoryTree[product.category as Category] || {}));
  }, [product?.category]);

  useEffect(() => {
    if (!product?.category || !product?.subcategory) return;
    const cat = categoryTree[product.category as Category];
    setProductTypes((cat?.[product.subcategory as keyof typeof cat] || []) as string[]);
  }, [product?.category, product?.subcategory]);

  // ── Price validation ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!product) return;
    const old_ = parseFloat(String(product.oldPrice)) || 0;
    const new_ = parseFloat(String(product.price))    || 0;
    if (old_ > 0 && new_ > 0 && old_ <= new_) {
      setPriceError('Original price must be higher than the selling price.');
    } else {
      setPriceError('');
    }
  }, [product?.price, product?.oldPrice]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    if (!product) return;
    const { name, value } = e.target;
    setProduct(prev => prev ? { ...prev, [name]: value } : prev);

    // Reset subcategory / type on category change
    if (name === 'category') {
      setProduct(prev => prev ? { ...prev, subcategory: '', productType: '' } : prev);
    }
    if (name === 'subcategory') {
      setProduct(prev => prev ? { ...prev, productType: '' } : prev);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (priceError) return toast.error(priceError);
    setSaving(true);
    try {
      const res  = await fetch(`/api/seller/products/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(product),
      });
      const json = await res.json();
      if (json.success) {
        setSaved(true);
        toast.success('Product updated!');
        setTimeout(() => router.push('/seller/inventory'), 1500);
      } else {
        toast.error(json.message || 'Update failed.');
      }
    } catch {
      toast.error('Error saving changes.');
    } finally {
      setSaving(false);
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const priceNum    = parseFloat(String(product?.price))    || 0;
  const oldPriceNum = parseFloat(String(product?.oldPrice)) || 0;
  const discount    = oldPriceNum > priceNum && priceNum > 0
    ? Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100)
    : 0;

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] pt-24 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
          <Loader2 size={20} className="text-orange-500 animate-spin" />
        </div>
        <p className="text-sm text-gray-400">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] pt-24 flex flex-col items-center justify-center gap-4">
        <Package size={32} className="text-gray-300" />
        <p className="text-sm text-gray-500">Product not found.</p>
        <button onClick={() => router.back()} className="text-orange-500 text-sm font-semibold hover:underline">← Go back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">

        {/* ── Page header ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <button
            onClick={() => router.push('/seller/inventory')}
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-orange-500 hover:border-orange-300 transition-all"
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.15em] mb-0.5">Seller Hub · Inventory</p>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
              Edit Product<span className="text-orange-500">.</span>
            </h1>
          </div>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

            {/* ── Form column ────────────────────────────────────────────── */}
            <div className="space-y-5">

              {/* Basic details */}
              <Section icon={Package} title="Product Details">
                <Field label="Product Name" required>
                  <input
                    type="text" name="name"
                    value={product.name}
                    onChange={handleChange}
                    placeholder="Product name"
                    className={inputCls}
                    required
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Category" required>
                    <select name="category" value={product.category || ''} onChange={handleChange} className={selectCls} required>
                      <option value="">Select…</option>
                      {Object.keys(categoryTree).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Subcategory">
                    <select name="subcategory" value={product.subcategory || ''} onChange={handleChange} className={selectCls} disabled={!product.category}>
                      <option value="">Select…</option>
                      {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Product Type">
                    <select name="productType" value={product.productType || ''} onChange={handleChange} className={selectCls} disabled={!product.subcategory}>
                      <option value="">Select…</option>
                      {productTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Condition">
                    <select name="condition" value={product.condition || ''} onChange={handleChange} className={selectCls}>
                      <option value="">Select…</option>
                      <option value="brand_new">Brand New</option>
                      <option value="used">Used</option>
                      <option value="refurbished">Refurbished</option>
                    </select>
                  </Field>
                  <Field label="Quantity in Stock" required>
                    <input type="number" min="0" name="quantity" value={product.quantity} onChange={handleChange} className={inputCls} required />
                  </Field>
                </div>

                {/* Optional specs */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Brand', 'brand', product.brand],
                    ['Model', 'model', product.model],
                    ['Color', 'color', product.color],
                    ['Weight (kg)', 'weight', product.weight],
                    ['Warranty', 'warranty', product.warranty],
                    ['Dimensions', 'dimensions', product.dimensions],
                  ].map(([label, name, val]) => (
                    <Field key={name as string} label={label as string} hint="Optional">
                      <input
                        type="text" name={name as string}
                        value={String(val ?? '')}
                        onChange={handleChange}
                        placeholder={label as string}
                        className={inputCls}
                      />
                    </Field>
                  ))}
                </div>
              </Section>

              {/* Pricing */}
              <Section icon={Tag} title="Pricing">
                {/* Info callout */}
                <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    <strong>Original price</strong> must be <strong>higher</strong> than the selling price to display a discount badge to buyers.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Original Price (KES)" hint="Before discount" error={priceError}>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Ksh</span>
                      <input
                        type="number" min="0" name="oldPrice"
                        value={product.oldPrice || ''}
                        onChange={handleChange}
                        placeholder="e.g. 5999"
                        className={`${inputCls} pl-12`}
                      />
                    </div>
                  </Field>

                  <Field label="Selling Price (KES)" required>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Ksh</span>
                      <input
                        type="number" min="0" name="price"
                        value={product.price || ''}
                        onChange={handleChange}
                        placeholder="e.g. 3999"
                        className={`${inputCls} pl-12`}
                        required
                      />
                    </div>
                  </Field>
                </div>

                {/* Live price preview */}
                {priceNum > 0 && (
                  <div className="flex flex-wrap items-center gap-4 bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 text-sm">
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Buyer Sees</p>
                      <div className="flex items-center gap-2">
                        {oldPriceNum > priceNum && (
                          <span className="line-through text-gray-400 text-xs">Ksh {oldPriceNum.toLocaleString()}</span>
                        )}
                        <span className="font-black text-gray-900">Ksh {priceNum.toLocaleString()}</span>
                        {discount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">-{discount}%</span>
                        )}
                      </div>
                    </div>
                    <div className="border-l border-gray-200 pl-4">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Platform Fee (5%)</p>
                      <p className="font-semibold text-gray-700">Ksh {(priceNum * 0.05).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="border-l border-gray-200 pl-4">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Buyer Pays</p>
                      <p className="font-black text-orange-600">Ksh {(priceNum * 1.05).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                  </div>
                )}
              </Section>

              {/* Shipping */}
              <Section icon={Truck} title="Shipping">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Fulfillment Mode">
                    <select name="fulfillmentMode" value={product.fulfillmentMode || ''} onChange={handleChange} className={selectCls}>
                      <option value="">Select…</option>
                      <option value="company">Fulfilled by NovaXmax</option>
                      <option value="seller">Fulfilled by Seller</option>
                      <option value="thirdparty">Dropshipping / Third-Party</option>
                    </select>
                  </Field>
                  <Field label="County">
                    <input type="text" name="county" value={product.county || ''} onChange={handleChange} placeholder="e.g. Nairobi" className={inputCls} />
                  </Field>
                </div>
                <Field label="Town">
                  <input type="text" name="town" value={product.town || ''} onChange={handleChange} placeholder="e.g. Westlands" className={inputCls} />
                </Field>
              </Section>

              {/* Submit */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-sm font-bold text-gray-800">Save changes</p>
                    <p className="text-xs text-gray-400 mt-0.5">Updates go live immediately for buyers.</p>
                  </div>
                  <button
                    type="submit"
                    disabled={saving || !!priceError || saved}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-orange-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saved ? (
                      <><CheckCircle2 size={15} /> Saved!</>
                    ) : saving ? (
                      <><Loader2 size={15} className="animate-spin" /> Saving…</>
                    ) : (
                      <><Save size={15} /> Save Changes</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <div className="hidden lg:block sticky top-28 space-y-4">

              {/* Current product card preview */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                  <Eye size={13} className="text-gray-400" />
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Buyer Preview</p>
                </div>
                <div className="p-4">
                  <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden mb-3">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                        <ImageOff size={24} />
                        <p className="text-xs">No image</p>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-800 leading-snug line-clamp-2 mb-1">{product.name || '—'}</p>
                  {product.condition && (
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mb-2">
                      {{brand_new:'Brand New',used:'Used',refurbished:'Refurbished'}[product.condition] || product.condition}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    {oldPriceNum > priceNum && priceNum > 0 && (
                      <span className="text-xs text-gray-400 line-through">Ksh {oldPriceNum.toLocaleString()}</span>
                    )}
                    <span className="text-base font-black text-orange-600">
                      {priceNum > 0 ? `Ksh ${priceNum.toLocaleString()}` : '—'}
                    </span>
                    {discount > 0 && (
                      <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">-{discount}%</span>
                    )}
                  </div>
                  {(product.town || product.county) && (
                    <p className="text-[11px] text-gray-400 flex items-center gap-1">
                      <MapPin size={10} /> {[product.town, product.county].filter(Boolean).join(', ')}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={10}
                        className={s <= Math.round(product.averageRating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
                      />
                    ))}
                    <span className="text-[10px] text-gray-400 ml-1">{product.reviewCount || 0} reviews</span>
                  </div>
                </div>
              </div>

              {/* Quick stats for this product */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 space-y-3">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Product Stats</p>
                {[
                  { label: 'Views',   value: (product.views  || 0).toLocaleString() },
                  { label: 'Visits',  value: (product.visits || 0).toLocaleString() },
                  { label: 'Reviews', value: (product.reviewCount || 0).toLocaleString() },
                  { label: 'Rating',  value: product.averageRating ? `${product.averageRating.toFixed(1)} / 5` : 'No ratings' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className="text-xs font-bold text-gray-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}