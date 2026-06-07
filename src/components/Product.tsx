'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '@/app/context/CartContext';
import {
  Tag, Package, MapPin, CheckCircle, XCircle, ShoppingCart,
  ChevronRight, ShieldCheck, Truck, RotateCcw, BadgeCheck,
  Star, Eye, Zap, Lock, Clock, AlertTriangle,
  MoreVertical, Flag, CreditCard, Smartphone, Headphones
} from "lucide-react";
import type { ProductType } from "@/app/types/product";
import RelatedProducts from '@/components/RelatedProducts';
import CustomersAlsoViewed from "@/components/CustomersAlsoViewed";
import RecentlyViewed from "@/components/RecentlyViewed";
import SaveToRecentlyViewed from '@/components/SaveToRecentlyViewed';
import BehaviorTracker from '@/components/BehaviourTracker';
import ProductImageViewer from '@/components/ProductImageViewer';
import SellerSection from '@/components/SellerSection';
import MoreFromSeller from '@/components/MoreFromSeller';
import BuyerLoginModal from '@/components/modals/BuyerLoginModal';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Section } from './SectionWrapper';

/* ─── tiny helpers ─────────────────────────────────────────────────── */
const Card = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ children, className = '' }, ref) => (
    <div ref={ref} className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {children}
    </div>
  )
);
Card.displayName = 'Card';

const TrustPill = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 text-orange-700 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap">
    {icon}
    <span>{label}</span>
  </div>
);

/* ─── main component ────────────────────────────────────────────────── */
export default function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState<ProductType | null>(null);
  const { addToCart, cartItems, increaseQuantity, decreaseQuantity } = useCart();
  const [userId, setUserId] = useState<string | null>(null);

  // report modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);

  // login modal
  const [showLoginModal, setShowLoginModal] = useState(false);

  // sticky bar
  const [showStickyBar, setShowStickyBar] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);

  // fake "viewers" — replace with real data if you have it
  const [viewers] = useState(() => Math.floor(Math.random() * 18) + 4);

  /* ── scroll spy for sticky bar ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (titleRef.current) observer.observe(titleRef.current);
    return () => observer.disconnect();
  }, [product]);

  /* ── file change ── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setScreenshot(file);
  };

  /* ── report submit ── */
  const handleReportSubmit = async () => {
    if (!product?._id) return;
    const formData = new FormData();
    formData.append('productId', product._id.toString());
    formData.append('userId', userId || '');
    formData.append('reason', reportReason);
    formData.append('message', reportMessage);
    if (screenshot) formData.append('screenshot', screenshot);
    try {
      const res = await fetch('/api/report-product', { method: 'POST', body: formData });
      if (res.ok) {
        setReportSuccess(true);
        setReportReason(''); setReportMessage(''); setScreenshot(null);
        setShowReportModal(false);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (reportSuccess) {
      const t = setTimeout(() => setReportSuccess(false), 4000);
      return () => clearTimeout(t);
    }
  }, [reportSuccess]);

  /* ── view tracking ── */
  useEffect(() => {
    if (!product) return;
    const startTime = Date.now();
    fetch('/api/product/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product._id, sellerId: product.sellerId }),
    });
    const handleBeforeUnload = () => {
      if (Date.now() - startTime < 5000) {
        navigator.sendBeacon('/api/product/views', JSON.stringify({
          productId: product._id, sellerId: product.sellerId, bounced: true,
        }));
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [product]);

  /* ── userId ── */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const _id = localStorage.getItem('userId');
      if (_id) setUserId(_id);
    }
  }, []);

  /* ── fetch product ── */
  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      const res = await fetch(`/api/product/products/${slug}`);
      const data = await res.json();
      setProduct(data.product);
    };
    fetchProduct();
  }, [slug]);

  /* ── add to cart ── */
  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product._id,
      name: product.name,
      images: product.images,
      brand: product.brand,
      model: product.model,
      county: product.county,
      town: product.town,
      weight: product.weight,
      calculatedPrice: product.calculatedPrice,
      quantity: 1,
      fulfillmentMode: product.fulfillmentMode,
      sellerId: product.sellerId,
      productId: product._id,
    });
  };

  /* ── loading state ── */
  if (!product) return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400 animate-pulse">Loading product…</p>
      </div>
    </div>
  );

  const cartItem = cartItems.find((item) => item.id === product._id);
  const savings = product.oldPrice ? product.oldPrice - product.calculatedPrice : 0;
  const discountPct = product.oldPrice
    ? Math.round((savings / product.oldPrice) * 100)
    : 0;
  const isLowStock = product.quantity > 0 && product.quantity <= 5;
  const isNairobi = product.county?.toLowerCase().includes('nairobi');

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sticky Summary Bar ── */}
      <div
        className={`fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-200 shadow-sm transition-all duration-300 ${showStickyBar ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-gray-800 truncate flex-1">{product.name}</p>
          <span className="text-orange-600 font-bold text-sm whitespace-nowrap">
            Ksh {product.calculatedPrice.toLocaleString()}
          </span>
          {cartItem ? (
            <div className="flex items-center gap-2">
              <button onClick={() => decreaseQuantity(product._id)} className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-bold text-lg flex items-center justify-center hover:bg-orange-200 transition">−</button>
              <span className="text-sm font-semibold w-4 text-center">{cartItem.quantity}</span>
              <button onClick={() => increaseQuantity(product._id)} className="w-7 h-7 rounded-full bg-orange-500 text-white font-bold text-lg flex items-center justify-center hover:bg-orange-600 transition">+</button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-1.5 bg-orange-500 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-orange-600 transition shadow"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add to Cart
            </button>
          )}
        </div>
      </div>

      {/* ── Page Wrapper ── */}
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-24">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center text-xs text-gray-400 whitespace-nowrap overflow-x-auto gap-1 mb-5 pb-1">
          {['Home', 'Shop', 'Products', product.category, product.subcategory, product.productType].filter(Boolean).map((crumb, i, arr) => (
            <span key={i} className="flex items-center gap-1">
              <span className={i === arr.length - 1 ? 'text-gray-600 font-medium' : ''}>{crumb}</span>
              {i < arr.length - 1 && <ChevronRight className="w-3 h-3 shrink-0" />}
            </span>
          ))}
        </nav>

        {/* ── Images ── */}
        <div className="mb-4 rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
          <ProductImageViewer images={product.images} name={product.name} />
        </div>

        {/* ── Live Viewers Badge ── */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 px-1">
          <Eye className="w-3.5 h-3.5 text-orange-400" />
          <span><strong className="text-gray-700">{viewers} people</strong> are viewing this right now</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-1" />
        </div>

        {/* ── Trust Pills ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5 no-scrollbar">
          <TrustPill icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Secure Payment" />
          <TrustPill icon={<Truck className="w-3.5 h-3.5" />} label="Fast Delivery" />
          <TrustPill icon={<RotateCcw className="w-3.5 h-3.5" />} label="Easy Returns" />
          <TrustPill icon={<BadgeCheck className="w-3.5 h-3.5" />} label="Verified Seller" />
        </div>

        {/* ── Product Info Card ── */}
        <Card className="mb-4 px-4 py-5 space-y-4" ref={titleRef}>

          {/* Title + overflow menu */}
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold text-gray-900 leading-snug flex-1">{product.name}</h1>
            <div className="relative">
              <button
                onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {showOverflowMenu && (
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30">
                  <button
                    onClick={() => { setShowOverflowMenu(false); setShowReportModal(true); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                  >
                    <Flag className="w-4 h-4" />
                    Report this product
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Rating Row */}
          {(product.averageRating || product.reviewCount) && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(product.averageRating ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">{product.averageRating?.toFixed(1)}</span>
              {product.reviewCount > 0 && (
                <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
              )}
            </div>
          )}

          {/* Brand & Model */}
          {(product.brand || product.model) && (
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {product.brand && (
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  <span>{product.brand}</span>
                </div>
              )}
              {product.model && (
                <div className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-gray-400" />
                  <span>{product.model}</span>
                </div>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-extrabold text-orange-600 tracking-tight">
                Ksh {product.calculatedPrice.toLocaleString()}
              </p>
              {product.oldPrice && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm line-through text-gray-400">
                    Ksh {product.oldPrice.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
                    {discountPct}% OFF
                  </span>
                </div>
              )}
            </div>
            {savings > 0 && (
              <div className="bg-green-50 border border-green-100 text-green-700 text-xs font-semibold px-3 py-2 rounded-xl text-right">
                <p className="text-xs text-green-500 font-normal">You save</p>
                <p>Ksh {savings.toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Stock + Location */}
          <div className="flex items-center justify-between text-sm pt-1">
            <div className="flex items-center gap-2">
              {product.quantity > 0 ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className={`font-semibold ${isLowStock ? 'text-red-500' : 'text-green-600'}`}>
                    {isLowStock ? `Only ${product.quantity} left!` : `${product.quantity} in stock`}
                  </span>
                  {isLowStock && <Zap className="w-3.5 h-3.5 text-red-400 animate-pulse" />}
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="font-semibold text-red-500">Out of stock</span>
                </>
              )}
            </div>
            {product.county && (
              <div className="flex items-center gap-1 text-gray-500">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{product.town ? `${product.town}, ` : ''}{product.county}</span>
              </div>
            )}
          </div>
        </Card>

        {/* ── Delivery Promise Card ── */}
        <Card className="mb-4">
          <div className="px-4 py-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-500" />
              Delivery Information
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {isNairobi ? 'Same-day delivery' : '1–3 business days'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isNairobi
                      ? 'Order before 12PM for same-day delivery in Nairobi'
                      : `Delivery to ${product.county} and other counties`}
                  </p>
                </div>
              </div>
              {product.fulfillmentMode && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 capitalize">{product.fulfillmentMode}</p>
                    <p className="text-xs text-gray-500">Fulfillment method for this product</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Easy Returns</p>
                  <p className="text-xs text-gray-500">Return within 7 days if not satisfied</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Payment & Security Card ── */}
        <Card className="mb-4">
          <div className="px-4 py-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-500" />
              Secure Payment
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {/* M-Pesa */}
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                <Smartphone className="w-3.5 h-3.5" />
                M-Pesa
              </div>
              {/* Visa */}
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                <CreditCard className="w-3.5 h-3.5" />
                Visa
              </div>
              {/* Mastercard */}
              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                <CreditCard className="w-3.5 h-3.5" />
                Mastercard
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />
              <span>256-bit SSL encrypted. Your payment details are always safe.</span>
            </div>
          </div>
        </Card>

        {/* ── Seller Section ── */}
        <div className="mb-4">
          <SellerSection product={product} showLoginModal={() => setShowLoginModal(true)} />
        </div>

        <SaveToRecentlyViewed id={product._id.toString()} />

        {/* ── Recently Viewed ── */}
        <Card className="mb-4">
          <RecentlyViewed />
        </Card>

        {/* ── Description ── */}
        {product.description && (
          <Card className="mb-4">
            <div className="px-4 py-5">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
                <h2 className="text-base font-bold text-gray-900">Description</h2>
                <Link
                  href={`/product/${product.slug}/description`}
                  className="md:hidden flex items-center gap-1 text-xs font-semibold text-orange-600"
                >
                  View full <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div
                className="prose prose-sm max-w-none text-gray-600 md:line-clamp-none line-clamp-4"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          </Card>
        )}

        {/* ── Key Features ── */}
        {Array.isArray(product.keyFeatures) && product.keyFeatures.length > 0 && (
          <Card className="mb-4">
            <div className="px-4 py-5">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
                Key Features
              </h2>
              <ul className="space-y-2">
                {product.keyFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        )}

        {/* ── Box Contents ── */}
        {Array.isArray(product.boxContents) && product.boxContents.length > 0 && (
          <Card className="mb-4">
            <div className="px-4 py-5">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
                What&apos;s in the Box
              </h2>
              <ul className="space-y-2">
                {product.boxContents.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <Package className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        )}

        {/* ── Specifications ── */}
        <Card className="mb-4">
          <div className="px-4 py-5">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
              Specifications
            </h2>
            <div className="space-y-5">

              {(product.brand || product.model || product.color) && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Product Details</p>
                  <div className="divide-y divide-gray-50">
                    {[
                      { label: 'Brand', value: product.brand },
                      { label: 'Model', value: product.model },
                      { label: 'Color', value: product.color },
                    ].filter(r => r.value).map((row) => (
                      <div key={row.label} className="flex justify-between py-2 text-sm">
                        <span className="text-gray-500">{row.label}</span>
                        <span className="font-medium text-gray-800">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(product.material || product.dimensions || product.weight) && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Physical Specs</p>
                  <div className="divide-y divide-gray-50">
                    {[
                      { label: 'Material', value: product.material },
                      { label: 'Dimensions', value: product.dimensions },
                      { label: 'Weight', value: product.weight },
                    ].filter(r => r.value).map((row) => (
                      <div key={row.label} className="flex justify-between py-2 text-sm">
                        <span className="text-gray-500">{row.label}</span>
                        <span className="font-medium text-gray-800">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.warranty && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Warranty</p>
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-gray-500">Coverage</span>
                    <span className="font-medium text-gray-800">{product.warranty}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* ── Related & Discovery ── */}
        <Card className="mb-4">
          <RelatedProducts name={product.name} currentId={product._id.toString()} />
        </Card>
        <Card className="mb-4">
          <CustomersAlsoViewed productId={product._id.toString()} />
        </Card>
        <Card className="mb-4">
          <BehaviorTracker product={product} />
        </Card>
        <Card className="mb-4">
          <MoreFromSeller sellerId={product.sellerId} currentProductId={product._id.toString()} />
        </Card>

        {/* ── Report success toast ── */}
        {reportSuccess && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-600 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg z-50 flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4" />
            Report submitted successfully
          </div>
        )}
      </div>

      {/* ════ Fixed Add-to-Cart Bar ════ */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3"
           style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
        <div className="max-w-6xl mx-auto">
          {product.quantity <= 0 ? (
            <div className="flex items-center justify-center gap-2 bg-gray-100 text-gray-500 py-3 rounded-2xl text-sm font-semibold">
              <XCircle className="w-4 h-4" />
              Out of Stock
            </div>
          ) : cartItem ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">In your cart</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => decreaseQuantity(product._id)}
                  className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold text-xl flex items-center justify-center hover:bg-orange-200 active:scale-95 transition"
                >
                  −
                </button>
                <span className="text-lg font-bold text-gray-900 w-5 text-center">{cartItem.quantity}</span>
                <button
                  onClick={() => increaseQuantity(product._id)}
                  className="w-10 h-10 rounded-full bg-orange-500 text-white font-bold text-xl flex items-center justify-center hover:bg-orange-600 active:scale-95 transition shadow"
                >
                  +
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-3.5 rounded-2xl hover:bg-orange-600 active:scale-[0.98] transition shadow-md shadow-orange-200 text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
              <Link
                href="/cart"
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-3.5 rounded-2xl hover:bg-gray-800 active:scale-[0.98] transition text-sm"
              >
                <Zap className="w-4 h-4" />
                Buy Now
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ════ Report Modal ════ */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <h2 className="text-base font-bold text-gray-900">Report this Product</h2>
              </div>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  <option value="">Select a reason</option>
                  <option value="Wrong price">Wrong price</option>
                  <option value="Incorrect description">Incorrect description</option>
                  <option value="Misleading images">Misleading images</option>
                  <option value="Inappropriate content">Inappropriate content</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Description (optional)</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                  rows={3}
                  value={reportMessage}
                  onChange={(e) => setReportMessage(e.target.value)}
                  placeholder="Explain the issue…"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Screenshot (optional)</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-orange-50 file:text-orange-600 file:text-xs file:font-semibold hover:file:bg-orange-100" />
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReportSubmit}
                disabled={!reportReason}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ Login Modal ════ */}
      {showLoginModal && <BuyerLoginModal onClose={() => setShowLoginModal(false)} />}

      {/* ── JSON-LD ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: product.name,
            image: product.images,
            rating: product.averageRating,
            reviews: product.reviewCount,
            description: product.description,
            offers: {
              '@type': 'Offer',
              price: product.calculatedPrice,
              priceCurrency: 'KES',
              availability: 'https://schema.org/InStock',
            },
          }),
        }}
      />
      <meta property="og:image" content={product.images[0]} />
              {/* 12 · Bottom trust strip — closes the page with confidence */}
        <Section>
          <BottomTrustStrip />
        </Section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRUST BADGES
═══════════════════════════════════════════════════════════════ */
const trustItems = [
  { icon: <ShieldCheck className="w-5 h-5 text-orange-500" />, title: 'Secure Payment',    sub: 'M-Pesa · Visa · Mastercard' },
  { icon: <Truck       className="w-5 h-5 text-orange-500" />, title: 'Fast Delivery',     sub: 'Same-day in Nairobi'        },
  { icon: <RotateCcw   className="w-5 h-5 text-orange-500" />, title: '7-Day Returns',     sub: 'Hassle-free policy'         },
  { icon: <Headphones  className="w-5 h-5 text-orange-500" />, title: '24/7 Support',      sub: 'Always here for you'        },
];

function TrustBadges() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
        {trustItems.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-4 hover:bg-orange-50/40 transition-colors">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{item.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
/* ═══════════════════════════════════════════════════════════════
   BOTTOM TRUST STRIP
═══════════════════════════════════════════════════════════════ */
function BottomTrustStrip() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1c1c1e 0%, #2d2d30 100%)' }}
    >
      <div className="px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        {[
          {
            icon: <ShieldCheck className="w-8 h-8 text-orange-400" />,
            title: '100% Buyer Protection',
            body: "Your money is safe. Full refund if item doesn't arrive or isn't as described.",
          },
          {
            icon: <Truck className="w-8 h-8 text-orange-400" />,
            title: 'Nationwide Delivery',
            body: 'Same-day Nairobi. 1–3 days to all 47 counties across Kenya.',
          },
          {
            icon: <RotateCcw className="w-8 h-8 text-orange-400" />,
            title: 'Easy 7-Day Returns',
            body: "Not happy? Return it within 7 days, no questions asked.",
          },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            {item.icon}
            <p className="text-white font-bold text-sm">{item.title}</p>
            <p className="text-gray-400 text-xs leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
