'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/app/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartNotification() {
  const { cartItems } = useCart();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (cartItems.length > 0) {
      setMessage(`🛒 ${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'} in cart —`);
      setShow(true);
      const timer = setTimeout(() => setShow(false), 4000);
      return () => clearTimeout(timer);
    } else if (cartItems.length === 0) {
      setMessage('🧺 Cart is now empty.');
      setShow(true);
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [cartItems]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="cart-message"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg text-sm flex items-center gap-2 z-50"
        >
          {message}
          {cartItems.length > 0 && (
            <a href="/cart" className="underline ml-2">Checkout</a>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
