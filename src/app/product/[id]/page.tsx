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
      calculatedPrice: product.calculatedPrice,
      quantity: 1,
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
    <span className="text-orange-700 font-medium">{product.category}</span>
    <ChevronRight className="mx-2 h-4 w-4 shrink-0" />
    <span className="text-orange-700 font-medium">{product.name}</span>
  </nav>
</div>


    {/* Main Product Section */}
{product && (
  <div className="bg-white rounded-lg shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
    <ProductImageViewer
      images={product.images}
      name={product.name}
    />
  </div>
)}

{/* Product Info Section */}
<div className="px-4 py-5 space-y-4 bg-white rounded-md shadow-sm text-gray-800">
  <h1 className="text-left text-2xl font-bold text-gray-900">{product.name}</h1>

  <p className="text-left text-sm font-medium text-blue-600">
    Brand: <span className="capitalize">{product.brand}</span>
  </p>
  
  <p className="text-left text-sm font-medium text-blue-600">
    Model: <span className="capitalize">{product.model}</span>
  </p>

  <div className="flex items-start gap-3">
    <span className="text-2xl font-extrabold text-orange-600">
      Ksh {product.calculatedPrice.toLocaleString()}
    </span>
    <span className="text-base text-gray-400 line-through">
      Ksh {product.oldPrice.toLocaleString()}
    </span>
    <span className="ml-auto text-sm px-2 py-1 bg-red-100 text-red-600 rounded-md">
      {Math.round(((product.oldPrice - product.calculatedPrice) / product.oldPrice) * 100)}% OFF
    </span>
  </div>

  <p className={`text-left text-sm font-semibold ${product.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
    {product.quantity > 0 ? `${product.quantity} unit${product.quantity > 1 ? 's' : ''} left` : 'Out of stock'}
  </p>

  <p className="text-left text-sm text-gray-600">
    + Shipping from <strong>{product.county}</strong>: <span className="text-orange-800 font-semibold">Ksh 200</span>
  </p>

</div>
    {/* Product Description */}
    {product.description && (
      <div className="mt-10 bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Product Description</h2>
        <div
          className="prose max-w-none text-gray-800"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      </div>
    )}

{Array.isArray(product.keyFeatures) && (
  <div className="mt-6 bg-white shadow rounded-lg p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-2">Key Features</h2>
  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
    {product.keyFeatures.map((feature, i) => (
      <li key={i}>{feature}</li>
    ))}
  </ul>
</div>
)}

{Array.isArray(product.boxContents) && (
  <div className="mt-6 bg-white shadow rounded-lg p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-2">What&apos;s in the Box</h2>
  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
    {product.boxContents.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
</div>
)}

<div className="mt-6 bg-white shadow rounded-lg p-6">
  <h2 className="text-xl font-semibold mb-4 border-b pb-2">Specifications</h2>
  <div className="grid grid-cols-2 gap-4 text-gray-700">
    {product.brand && <div><span className="font-medium">Brand:</span> {product.brand}</div>}
    {product.model && <div><span className="font-medium">Model:</span> {product.model}</div>}
    {product.material && <div><span className="font-medium">Main Material:</span> {product.material}</div>}
    {product.color && <div><span className="font-medium">Color:</span> {product.color}</div>}
    {product.dimensions && <div><span className="font-medium">Dimensions:</span> {product.dimensions}</div>}
    {product.weight && <div><span className="font-medium">Weight:</span> {product.weight}</div>}
    {product.warranty && <div><span className="font-medium">Warranty:</span> {product.warranty}</div>}
  </div>
</div>

      <SaveToRecentlyViewed id={product._id.toString()} />
      <RecentlyViewed />
      <RelatedProducts name={product.name} currentId={product._id.toString()} />
      <CustomersAlsoViewed productId={product._id.toString()} />
      <BehaviorTracker product={product} />
      {showLoginModal && <Login onClose={() => setShowLoginModal(false)} />}
      <SellerSection sellerId={product.sellerId} showLoginModal={() => setShowLoginModal(true)} />
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

