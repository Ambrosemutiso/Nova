'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';
import { CldImage } from 'next-cloudinary';
import { useRouter } from 'next/navigation';
import { Player } from '@lottiefiles/react-lottie-player';
import RecentlyViewed from "@/components/RecentlyViewed";

type County = 'Nairobi' | 'Mombasa' | 'Kisumu' | 'Nakuru';

export default function CartPage() {
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity } = useCart();
  const [loading, setLoading] = useState(false);
  const [county, setCounty] = useState<County | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const router = useRouter();

  const countyDeliveryFees: Record<County, number> = {
    Nairobi: 300,
    Mombasa: 350,
    Kisumu: 250,
    Nakuru: 200,
  };

  const handleCountyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCounty(e.target.value as County);
  };

  const deliveryFee = county ? countyDeliveryFees[county] : 200;
  const subtotal = cartItems.reduce((sum, item) => sum + item.calculatedPrice * item.quantity, 0);
  const total = subtotal + deliveryFee;

const getPublicId = (url?: string) => {
  if (!url || typeof url !== 'string') return '';
  const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
  return match ? match[1] : url;
};

  const handleCheckout = async () => {
    setLoading(true);
    try {
      router.push('/checkout');
    } catch (error) {
      alert('Checkout failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const confirmRemove = (id: string) => {
    setSelectedItemId(id);
    setShowModal(true);
  };

  const handleConfirmRemove = () => {
    if (selectedItemId) {
      removeFromCart(selectedItemId);
    }
    setShowModal(false);
    setSelectedItemId(null);
  };


  useEffect(() => {
  const timer = setTimeout(() => setLoading(false), 3000);
  return () => clearTimeout(timer);
}, []);


  if (loading)
    return (
  <div className="flex items-center justify-center min-h-screen bg-white">
    <div className="w-12 h-12 border-4 border-orange-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-112px)] pt-20">
        <Player
          autoplay
          loop
          src="https://assets5.lottiefiles.com/packages/lf20_qh5z2fdq.json"
          style={{ height: '300px', width: '300px' }}
        />
        <p className="mt-4 text-lg text-gray-700">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-28 pb-10 relative">
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 text-center shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Are you sure you want to remove this item?</h3>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleConfirmRemove}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
<div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Left: Cart Items */}
  <div className="md:col-span-2 space-y-6">
    {cartItems.map(item => (
      <div key={item.id} className="flex gap-4 border p-4 rounded-lg shadow-sm bg-white">
        <CldImage
          src={getPublicId(item.images[0])}
          alt={item.name}
          width="80"
          height="80"
          className="w-20 h-20 object-cover rounded"
        />
        <div className="flex flex-col justify-between w-full">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-800">{item.name}</p>
              <p className="text-sm text-gray-500 mt-1">Sold by: <span className="font-medium">Official Store</span></p>
              <p className="text-orange-600 mt-2 font-bold">Ksh.{item.calculatedPrice}</p>
            </div>
            <button
              onClick={() => confirmRemove(item.id)}
              className="text-red-500 text-xl font-bold hover:text-red-700"
            >
              ×
            </button>
          </div>

          <div className="flex items-center mt-3 gap-3">
            <button
              onClick={() => decreaseQuantity(item.id)}
              className="bg-orange-200 w-7 h-7 rounded hover:bg-orange-300 text-lg"
            >
              -
            </button>
            <span className="font-medium">{item.quantity}</span>
            <button
              onClick={() => increaseQuantity(item.id)}
              className="bg-orange-200 w-7 h-7 rounded hover:bg-orange-300 text-lg"
            >
              +
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>

  {/* Right: Cart Summary */}
  <div className="bg-white border p-6 rounded-lg shadow-sm h-fit">
    <h3 className="text-xl font-semibold mb-4">Order Summary</h3>

    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span className="font-medium">Ksh.{subtotal}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Delivery Fee</span>
        <span className="font-medium">Ksh.{deliveryFee}</span>
      </div>
      <div className="flex justify-between font-semibold border-t pt-3">
        <span>Total</span>
        <span>Ksh.{total}</span>
      </div>
    </div>

    <div className="mt-4">
      <select
        value={county}
        onChange={handleCountyChange}
        className="border border-gray-300 p-2 w-full rounded text-sm"
      >
        <option value="">Select County for Delivery</option>
        {Object.keys(countyDeliveryFees).map((county) => (
          <option key={county} value={county}>{county}</option>
        ))}
      </select>
    </div>

    <button
      onClick={handleCheckout}
      className="mt-5 w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition"
    >
      {loading ? 'Processing...' : 'Proceed to Checkout'}
    </button>
  </div>
  </div>
      <RecentlyViewed />
</div>
  );
}

