'use client';

import { useState } from 'react';
import { useCart } from '@/app/context/CartContext';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51RQPp2EQ4JYqEcBBXr6n3TAjMnQjVzEWkfZN81ZGwTEmyroE1hjCCm5ujv8nW8FiA74NgkxahD3aJhO6MIVEmLDD00XNwBDRRr');

export default function CheckoutPage() {
  const { cartItems } = useCart();
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
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

  const countyDeliveryFees = {
    Nairobi: 300,
    Mombasa: 350,
    Kisumu: 250,
    Nakuru: 200,
  };

  const deliveryFee = countyDeliveryFees[customerInfo.city as keyof typeof countyDeliveryFees] ?? 200;
  const subtotal = cartItems.reduce((sum, item) => sum + item.calculatedPrice * item.quantity, 0);
  const totalAmount = subtotal + deliveryFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const stripe = await stripePromise;

      const response = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.calculatedPrice,
            images: item.images,
          })),
          customerInfo,
          userId: '664aeb9c249b8b6d3d353d3a',
          deliveryFee,
          totalAmount,
        }),
      });

      const session = await response.json();
      await stripe?.redirectToCheckout({ sessionId: session.id });
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div>
          <h2 className="text-2xl font-bold mb-4">Delivery Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <input name="firstName" placeholder="First Name" onChange={handleChange} className="border p-2" />
            <input name="lastName" placeholder="Last Name" onChange={handleChange} className="border p-2" />
            <input name="email" placeholder="Email" onChange={handleChange} className="border p-2 col-span-2" />
            <input name="street" placeholder="Street" onChange={handleChange} className="border p-2 col-span-2" />
            <input name="city" placeholder="City" onChange={handleChange} className="border p-2" />
            <input name="state" placeholder="State" onChange={handleChange} className="border p-2" />
            <input name="zip" placeholder="Zip Code" onChange={handleChange} className="border p-2" />
            <input name="country" placeholder="Country" onChange={handleChange} className="border p-2" />
            <input name="phone" placeholder="Phone" onChange={handleChange} className="border p-2 col-span-2" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Cart Total</h2>
          <div className="border-b py-2">Subtotal: Ksh.{subtotal}</div>
          <div className="border-b py-2">Delivery Fee: Ksh.{deliveryFee}</div>
          <div className="border-b-2 py-2 font-semibold">Total: Ksh.{totalAmount}</div>
          <button
            onClick={handlePayment}
            className="mt-5 bg-orange-500 text-white py-2 rounded w-full hover:bg-orange-600"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
