'use client'; 

import { useState, useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';
import { Tag, Package, MapPin, CheckCircle, XCircle, ShoppingCart, ChevronRight } from "lucide-react";
import type { ProductType } from "@/app/types/product";
import RelatedProducts from '@/components/RelatedProducts'
import CustomersAlsoViewed from "@/components/CustomersAlsoViewed";
import RecentlyViewed from "@/components/RecentlyViewed";
import SaveToRecentlyViewed from '@/components/SaveToRecentlyViewed';
import BehaviorTracker from '@/components/BehaviourTracker';
import ProductImageViewer from '@/components/ProductImageViewer';
import SellerSection from '@/components/SellerSection';
import MoreFromSeller from '@/components/MoreFromSeller';
import BuyerLoginModal from '@/components/modals/BuyerLoginModal';
import Link from 'next/link';
import { useParams } from 'next/navigation'
import { Section } from './SectionWrapper';


export default function ProductDetails() {
    const { slug } = useParams();
const [product, setProduct] = useState<ProductType | null>(null);
  const { addToCart, cartItems, increaseQuantity, decreaseQuantity } = useCart();
  const [userId, setUserId] = useState<string | null>(null);
const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setScreenshot(file);
  };

const handleReportSubmit = async () => {
  if (!product?._id) return;

  const formData = new FormData();
  formData.append('productId', product._id.toString());
  formData.append('userId', userId || '');
  formData.append('reason', reportReason);
  formData.append('message', reportMessage);

  if (screenshot) {
    formData.append('screenshot', screenshot);
  }

  try {
    const res = await fetch('/api/report-product', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      setReportSuccess(true);
      setReportReason('');
      setReportMessage('');
      setScreenshot(null);
    } else {
      console.error('Report submission failed');
    }
  } catch (err) {
    console.error('Error submitting report:', err);
  }
};

  useEffect(() => {
    if (reportSuccess) {
      const timeout = setTimeout(() => setReportSuccess(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [reportSuccess]);

useEffect(() => {
  if (!product) return; // ✅ guard to prevent running when product is null

  const startTime = Date.now();

  // Record the view
  fetch("/api/product/views", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: product._id, sellerId: product.sellerId }),
  });

  // Track bounce (user leaves quickly)
  const handleBeforeUnload = () => {
    const timeSpent = Date.now() - startTime;
    if (timeSpent < 5000) {
      navigator.sendBeacon(
        "/api/product/views",
        JSON.stringify({
          productId: product._id,
          sellerId: product.sellerId,
          bounced: true,
        })
      );
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [product]);

  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const _id = localStorage.getItem('userId');
      if (_id) setUserId(_id);
    }
  }, []);

useEffect(() => {
  if (!slug) return;

  const fetchProduct = async () => {
    const res = await fetch(`/api/product/products/${slug}`);
    const data = await res.json();
    setProduct(data.product);
  };

  fetchProduct();
}, [slug]);


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

  if (!product)
    return (
    <div className="flex items-center justify-center min-h-screen bg-black/5 z-[999999999999999]">
      <div className="w-12 h-12 border-4 border-orange-500 border-dashed rounded-full animate-spin"></div>
    </div>
    );
return (
  <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white max-w-6xl mx-auto px-4 pt-28 pb-10"> {/* pt-28 to offset navbar height */}
  <div className="mb-6 overflow-x-auto">
  <nav className="flex items-center text-sm text-gray-500 whitespace-nowrap flex-nowrap gap-1 px-1">
    <span>Home</span>
    <ChevronRight className="mx-2 h-4 w-4 shrink-0" />
    <span>Shop</span>
    <ChevronRight className="mx-2 h-4 w-4 shrink-0" />
    <span>Products</span>
    <ChevronRight className="mx-2 h-4 w-4 shrink-0" />
    <span className="text-gray-500 font-medium">{product.category}</span>
    <ChevronRight className="mx-2 h-4 w-4 shrink-0" />
    <span className="text-gray-500 font-medium">{product.subcategory}</span>
    <ChevronRight className="mx-2 h-4 w-4 shrink-0" />
    <span className="text-gray-500 font-medium">{product.productType}</span>
    <ChevronRight className="mx-2 h-4 w-4 shrink-0" />
    <span className="text-gray-500 font-medium">{product.name}</span>
  </nav>
</div>


    {/* Main Product Section */}
{product && (
    <ProductImageViewer
      images={product.images}
      name={product.name}
    />
)}
{/* Product Info Section */}
<Section>
  <div className="px-1 py-1 space-y-4">

    {/* 🏷️ Title */}
    <h1 className="text-xl font-semibold text-gray-900 leading-snug">
      {product.name}
    </h1>

    {/* 🔖 Brand & Model */}
    <div className="flex items-center gap-4 text-sm text-gray-600">
      {product.brand && (
        <div className="flex items-center gap-1">
          <Tag className="w-4 h-4 text-gray-400" />
          <span>{product.brand}</span>
        </div>
      )}

      {product.model && (
        <div className="flex items-center gap-1">
          <Package className="w-4 h-4 text-gray-400" />
          <span>{product.model}</span>
        </div>
      )}
    </div>

    {/* 💰 Price Section */}
    <div className="flex items-end justify-between">
      <div>
        <p className="text-2xl font-bold text-orange-600">
          Ksh {product.calculatedPrice.toLocaleString()}
        </p>

        {product.oldPrice && (
          <div className="flex items-center gap-2 text-sm mt-1">
            <span className="line-through text-gray-400">
              Ksh {product.oldPrice.toLocaleString()}
            </span>
            <span className="text-red-500 font-medium">
              {Math.round(((product.oldPrice - product.calculatedPrice) / product.oldPrice) * 100)}% OFF
            </span>
          </div>
        )}
      </div>

      {/* 🔥 Discount Badge */}
      {product.oldPrice && (
        <div className="bg-red-50 text-red-500 text-xs font-semibold px-2 py-1 rounded">
          SAVE
        </div>
      )}
    </div>

    {/* 📦 Stock + Location */}
    <div className="flex items-center justify-between text-sm">

      {/* Stock */}
      <div className="flex items-center gap-2">
        {product.quantity > 0 ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <XCircle className="w-4 h-4 text-red-500" />
        )}

        <span
          className={`font-medium ${
            product.quantity > 0 ? "text-green-600" : "text-red-500"
          }`}
        >
          {product.quantity > 0
            ? `${product.quantity} left`
            : "Out of stock"}
        </span>
      </div>

      {/* Location */}
      {product.county && (
        <div className="flex items-center gap-1 text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>
            {product.town ? `${product.town}, ` : ""}
            {product.county}
          </span>
        </div>
      )}
    </div>

  </div>
</Section>
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "Product",
      name: product.name,
      image: product.images,
      rating: product.averageRating,
      reviews: product.reviewCount,
      description: product.description,
      offers: {
        "@type": "Offer",
        price: product.calculatedPrice,
        priceCurrency: "KES",
        availability: "https://schema.org/InStock",
      },
    }),
  }}
/>
<meta property="og:image" content={product.images[0]} />
{/* Product Description Section */}
{product.description && (
  <Section>
  <div className="px-4 py-5">
    <div className="flex justify-between items-center border-b pb-2 mb-3">
      <h2 className="text-lg md:text-xl font-semibold text-gray-900">
        Description
      </h2>

      {/* ➡️ Right Arrow for Mobile */}
<Link
  href={`/product/${product.slug}/description`}
  className="md:hidden text-orange-600 flex items-center gap-1 text-sm font-medium"
>
  View more
  <ChevronRight className="w-4 h-4" />
</Link>

    </div>

    {/* Description Content */}
    <div
      className={`prose max-w-none text-gray-700 ${
        // truncate only on mobile
        'md:line-clamp-none line-clamp-3'
      }`}
      dangerouslySetInnerHTML={{
        __html: product.description,
      }}
    />
  </div>
  </Section>
)}

{/* Key Features */}
{Array.isArray(product.keyFeatures) && product.keyFeatures.length > 0 && (
  <Section>
  <div className="px-4 py-5">
    <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b pb-1">
      Key Features
    </h2>
    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm md:text-base">
      {product.keyFeatures.map((feature, i) => (
        <li key={i}>{feature}</li>
      ))}
    </ul>
  </div>
  </Section>
)}

{/* Box Contents */}
{Array.isArray(product.boxContents) && product.boxContents.length > 0 && (
  <Section>
  <div className="px-4 py-5">
    <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b pb-1">
      What&apos;s in the Box
    </h2>
    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm md:text-base">
      {product.boxContents.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  </div>
  </Section>
)}

{/* Specifications */}
{/* Specifications */}
<Section>
  <div className="px-4 py-5">
    <h2 className="text-lg md:text-xl font-semibold mb-4 border-b pb-2">
      Specifications
    </h2>

    <div className="space-y-4 text-sm md:text-base">

      {/* 🏷 Product Details */}
      {(product.brand || product.model || product.color) && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Product Details</h3>
          <div className="space-y-1 text-gray-700">
            {product.brand && (
              <div className="flex justify-between">
                <span className="text-gray-500">Brand</span>
                <span className="font-medium">{product.brand}</span>
              </div>
            )}
            {product.model && (
              <div className="flex justify-between">
                <span className="text-gray-500">Model</span>
                <span>{product.model}</span>
              </div>
            )}
            {product.color && (
              <div className="flex justify-between">
                <span className="text-gray-500">Color</span>
                <span>{product.color}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📦 Physical Specs */}
      {(product.material || product.dimensions || product.weight) && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Physical Specs</h3>
          <div className="space-y-1 text-gray-700">
            {product.material && (
              <div className="flex justify-between">
                <span className="text-gray-500">Material</span>
                <span>{product.material}</span>
              </div>
            )}
            {product.dimensions && (
              <div className="flex justify-between">
                <span className="text-gray-500">Dimensions</span>
                <span>{product.dimensions}</span>
              </div>
            )}
            {product.weight && (
              <div className="flex justify-between">
                <span className="text-gray-500">Weight</span>
                <span>{product.weight}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🛡 Warranty */}
      {product.warranty && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Warranty</h3>
          <div className="flex justify-between text-gray-700">
            <span className="text-gray-500">Coverage</span>
            <span>{product.warranty}</span>
          </div>
        </div>
      )}

    </div>
  </div>
</Section>

      <SaveToRecentlyViewed id={product._id.toString()} />
      <Section>
      <RecentlyViewed />
      </Section>
      <Section>
      <RelatedProducts name={product.name} currentId={product._id.toString()} />
      </Section>
      <Section>
      <CustomersAlsoViewed productId={product._id.toString()} />
      </Section>
      <Section>
      <BehaviorTracker product={product} />
      {showLoginModal && <BuyerLoginModal onClose={() => setShowLoginModal(false)} />}
      <SellerSection product={product} showLoginModal={() => setShowLoginModal(true)} />
      </Section>
      <Section>
      <MoreFromSeller sellerId={product.sellerId} currentProductId={product._id.toString()} />
      </Section>
<button className="text-sm text-red-600 underline mt-4" onClick={() => setShowReportModal(true)}>Report Incorrect Product Details</button>
{showReportModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-5 rounded shadow-md w-11/12 max-w-md space-y-3">
      <h2 className="text-lg font-semibold">Report this Product</h2>

      <label className="block text-sm font-medium">Reason</label>
      <select
        value={reportReason}
        onChange={(e) => setReportReason(e.target.value)}
        className="w-full border border-gray-300 rounded p-2"
      >
        <option value="">Select a reason</option>
        <option value="Wrong price">Wrong price</option>
        <option value="Incorrect description">Incorrect description</option>
        <option value="Misleading images">Misleading images</option>
        <option value="Inappropriate content">Inappropriate content</option>
        <option value="Other">Other</option>
      </select>
      <label className="block text-sm font-medium">Description (optional)</label>
      <textarea className="w-full border border-gray-300 rounded p-2" rows={3} value={reportMessage} onChange={(e) => setReportMessage(e.target.value)} placeholder="Explain the issue (optional)"/>
      <label className="block text-sm font-medium">Screenshot (optional)</label>
        <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full"/>
      <div className="flex justify-end space-x-2 pt-2">
        <button onClick={() => setShowReportModal(false)} className="px-3 py-1 bg-gray-300 rounded">Cancel</button>
        <button onClick={handleReportSubmit} className="px-3 py-1 bg-red-600 text-white rounded">Submit</button>
      </div>
    </div>
  </div>
)}
      {reportSuccess && (
        <p className="text-green-600 mt-2">Report submitted successfully!</p>
      )}


      {/* 🛒 Add to Cart Section */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
        {(() => {
          const cartItem = cartItems.find((item) => item.id === product._id);
          return cartItem ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => decreaseQuantity(product._id)}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                -
              </button>
              <span>{cartItem.quantity}</span>
              <button
                onClick={() => increaseQuantity(product._id)}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-2 bg-orange-600 text-white py-3 px-6 rounded-full shadow-xl hover:bg-orange-700 transition duration-300"
              >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
          );
        })()}
      </div>
    </div>
  );
}







