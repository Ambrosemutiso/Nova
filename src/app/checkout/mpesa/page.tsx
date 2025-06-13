//app/checkout/mpesa/page.tsx
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

  // Get userId from localStorage when component mounts
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
  try {
    if (!userId) {
      alert('User not logged in.');
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
        })),
        deliveryFee,
        userId,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      const orderId = result.orderId;

      // ✅ Poll for payment confirmation every 3 seconds
      const interval = setInterval(async () => {
        const statusRes = await fetch(`/api/orders/status?orderId=${orderId}`);
        const statusData = await statusRes.json();

        if (statusData.status === 'Paid') {
          clearInterval(interval);
          router.push('/success');
        } else if (statusData.status === 'Cancelled') {
          clearInterval(interval);
          toast.error('Payment cancelled or failed.');
        }
      }, 3000);
    } else {
      alert('Payment initiation failed: ' + result.message);
    }
  } catch (error) {
    console.error('Payment error:', error);
    toast.error('An error occurred during payment.');
  } finally {
    toast.loading('Waiting for M-Pesa confirmation...');
  }
};



  return (
    <div className="flex justify-center items-center py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div>
          <h2 className="text-2xl font-bold mb-4">Delivery Information</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(customerInfo).map(([key, value]) => (
              <input
                key={key}
                name={key}
                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                value={value}
                onChange={handleChange}
                className="border p-2 col-span-2 md:col-span-1"
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Cart Total</h2>
          <div className="border-b py-2">Subtotal: Ksh.{subtotal}</div>
          <div className="border-b py-2">Delivery Fee: Ksh.{deliveryFee}</div>
          <div className="border-b-2 py-2 font-semibold">Total: Ksh.{totalAmount}</div>
<button
  onClick={handlePayment}
  className="mt-5 bg-green-500 text-white py-2 rounded w-full hover:bg-green-600 disabled:opacity-50"
  disabled={loading}
>
  {loading ? (
    <div className="flex items-center justify-center space-x-2">
      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
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
