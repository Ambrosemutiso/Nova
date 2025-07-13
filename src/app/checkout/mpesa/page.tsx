'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export default function CheckoutPage() {
  const { cartItems } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    setUserId(storedUserId);
  }, []);

  const countyDeliveryFees: Record<string, number> = {
    Nairobi: 300,
    Mombasa: 350,
    Kisumu: 250,
    Nakuru: 200,
  };

  const deliveryFee = countyDeliveryFees[customerInfo.city] ?? 1;
  const subtotal = cartItems.reduce((sum, item) => sum + item.calculatedPrice * item.quantity, 0);
  const totalAmount = subtotal + deliveryFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
  };

const handlePayment = async () => {
  setLoading(true);
  toast.loading('Waiting for M-Pesa confirmation...');

  try {
    if (!userId) {
      toast.error('User not logged in.');
      setLoading(false);
      return;
    }

    const normalizedPhone = customerInfo.phone.replace(/^0/, '254');

    const response = await fetch('/api/checkout/mpesa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: normalizedPhone,
        totalAmount,
        customerInfo,
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.calculatedPrice,
          images: item.images,
          productId: item.productId || item.id,
          sellerId: item.sellerId, 
        })),
        deliveryFee,
        userId,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      const orderId = result.orderId;
      let attempts = 0;
      const maxAttempts = 10;

      const interval = setInterval(async () => {
        attempts++;

        const statusRes = await fetch(`/api/orders/status?orderId=${orderId}`);
        const statusData = await statusRes.json();

        if (statusData.status === 'Paid') {
          clearInterval(interval);
          toast.dismiss(); 
          toast.success('Payment successful!');
          localStorage.removeItem('cart'); 
          router.push('/orders'); 
        } else if (statusData.status === 'Cancelled') {
          clearInterval(interval);
          toast.dismiss();
          toast.error('Payment cancelled.');
          router.push('/cart');
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          toast.dismiss();
          toast.error('Transaction timed out. Try again.');
          router.push('/cart');
        }
      }, 3000);
    } else {
      toast.dismiss();
      toast.error('Payment failed: ' + result.message);
    }
  } catch (error) {
    console.error('Payment error:', error);
    toast.dismiss();
    toast.error('An error occurred during payment.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="pt-28 pb-10 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Delivery Info */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Delivery Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(customerInfo).map(([key, value]) => (
              <input
                key={key}
                name={key}
                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                value={value}
                onChange={handleChange}
                className="border p-2 rounded text-sm w-full"
              />
            ))}
          </div>
        </div>

        {/* Cart Summary */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Cart Total</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span>Subtotal:</span>
              <span>Ksh {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Delivery Fee:</span>
              <span>Ksh {deliveryFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold border-b-2 pb-2">
              <span>Total:</span>
              <span>Ksh {totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="mt-6 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span>Waiting for M-Pesa confirmation...</span>
              </div>
            ) : (
              'Pay with M-Pesa'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
