'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import { ShoppingCart, ChevronRight} from 'lucide-react';
import type { Product } from '@/app/types/product';
import RelatedProducts from '@/components/RelatedProducts'
import CustomersAlsoViewed from "@/components/CustomersAlsoViewed";
import RecentlyViewed from "@/components/RecentlyViewed";
import SaveToRecentlyViewed from '@/components/SaveToRecentlyViewed';
import BehaviorTracker from '@/components/BehaviourTracker';
import ProductImageViewer from '@/components/ProductImageViewer';
import SellerSection from '@/components/SellerSection';
import MoreFromSeller from '@/components/MoreFromSeller';
import Login from '@/components/Login';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
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
    const formData = new FormData();
   formData.append('productId', Array.isArray(id) ? id[0] : id || '');
    formData.append('userId', userId || '');
    formData.append('reason', reportReason);
    formData.append('message', reportMessage);
    if (screenshot) formData.append('screenshot', screenshot);

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
    if (typeof window !== 'undefined') {
      const _id = localStorage.getItem('userId');
      if (_id) setUserId(_id);
    }
  }, []);
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/product/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        setProduct(data.product);
      } catch (err) {
        console.error('Error fetching product:', err);
      }
    };

    fetchProduct();
  }, [id]);

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
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-12 h-12 border-4 border-orange-500 border-dashed rounded-full animate-spin"></div>
    </div>
    );
return (
  <div className="max-w-6xl mx-auto px-4 pt-28 pb-10"> {/* pt-28 to offset navbar height */}
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
<div className="p-6 bg-white rounded-2xl shadow-md text-gray-900 space-y-3">
  {/* Title */}
  <h1 className="text-3xl font-bold leading-tight tracking-tight">
    {product.name}
  </h1>

  {/* Brand + Model */}
  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
    {product.brand && (
      <span className="bg-gray-100 px-2.5 py-1 rounded-full capitalize">
        🏷 Brand: {product.brand}
      </span>
    )}
    {product.model && (
      <span className="bg-gray-100 px-2.5 py-1 rounded-full capitalize">
        ⚙️ Model: {product.model}
      </span>
    )}
  </div>

  {/* Price Section */}
  <div className="flex flex-wrap items-baseline gap-2 mt-2">
    <span className="text-3xl font-extrabold text-orange-600">
      Ksh {product.calculatedPrice.toLocaleString()}
    </span>

    {product.oldPrice && (
      <>
        <span className="text-base text-gray-400 line-through">
          Ksh {product.oldPrice.toLocaleString()}
        </span>
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-50 text-red-500">
          {Math.round(((product.oldPrice - product.calculatedPrice) / product.oldPrice) * 100)}% OFF
        </span>
      </>
    )}
  </div>

  {/* Stock Info */}
  <div className="flex items-center gap-2 mt-1">
    <div
      className={`w-2.5 h-2.5 rounded-full ${
        product.quantity > 0 ? 'bg-green-500' : 'bg-red-500'
      }`}
    />
    <p
      className={`text-sm font-medium ${
        product.quantity > 0 ? 'text-green-700' : 'text-red-500'
      }`}
    >
      {product.quantity > 0
        ? `${product.quantity} unit${product.quantity > 1 ? 's' : ''} left`
        : 'Out of stock'}
    </p>
  </div>

  {/* Shipping Info */}
  {product.county && (
    <p className="text-sm text-gray-600">
      🚚 Shipped from{' '}
      <span className="font-semibold text-gray-800">{product.county}</span>
      {product.town && (
        <>
          , <span className="text-orange-600 font-semibold">{product.town}</span>
        </>
      )}
    </p>
  )}
</div>

{/* Product Description Section */}
{product.description && (
  <div className="mt-8 bg-white shadow rounded-lg p-5">
    <div className="flex justify-between items-center border-b pb-2 mb-3">
      <h2 className="text-lg md:text-xl font-semibold text-gray-900">
        Description
      </h2>

      {/* ➡️ Right Arrow for Mobile */}
      <a
        href={`/product/${product._id}/description`}
        className="md:hidden text-orange-600 flex items-center gap-1 text-sm font-medium"
      >
        View more
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </a>
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
)}

{/* Key Features */}
{Array.isArray(product.keyFeatures) && product.keyFeatures.length > 0 && (
  <div className="mt-6 bg-white shadow rounded-lg p-5">
    <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b pb-1">
      Key Features
    </h2>
    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm md:text-base">
      {product.keyFeatures.map((feature, i) => (
        <li key={i}>{feature}</li>
      ))}
    </ul>
  </div>
)}

{/* Box Contents */}
{Array.isArray(product.boxContents) && product.boxContents.length > 0 && (
  <div className="mt-6 bg-white shadow rounded-lg p-5">
    <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b pb-1">
      What&apos;s in the Box
    </h2>
    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm md:text-base">
      {product.boxContents.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  </div>
)}

{/* Specifications */}
<div className="mt-6 bg-white shadow rounded-lg p-5">
  <h2 className="text-lg md:text-xl font-semibold mb-3 border-b pb-2">
    Specifications
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700 text-sm md:text-base">
    {product.brand && (
      <div>
        <span className="font-medium">Brand:</span> {product.brand}
      </div>
    )}
    {product.model && (
      <div>
        <span className="font-medium">Model:</span> {product.model}
      </div>
    )}
    {product.material && (
      <div>
        <span className="font-medium">Main Material:</span> {product.material}
      </div>
    )}
    {product.color && (
      <div>
        <span className="font-medium">Color:</span> {product.color}
      </div>
    )}
    {product.dimensions && (
      <div>
        <span className="font-medium">Dimensions:</span> {product.dimensions}
      </div>
    )}
    {product.weight && (
      <div>
        <span className="font-medium">Weight:</span> {product.weight}
      </div>
    )}
    {product.warranty && (
      <div>
        <span className="font-medium">Warranty:</span> {product.warranty}
      </div>
    )}
  </div>
</div>


      <SaveToRecentlyViewed id={product._id.toString()} />
      <RecentlyViewed />
      <RelatedProducts name={product.name} currentId={product._id.toString()} />
      <CustomersAlsoViewed productId={product._id.toString()} />
      <BehaviorTracker product={product} />
      {showLoginModal && <Login onClose={() => setShowLoginModal(false)} />}
      <SellerSection product={product} showLoginModal={() => setShowLoginModal(true)} />
      <MoreFromSeller sellerId={product.sellerId} currentProductId={product._id.toString()} />
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

