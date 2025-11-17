'use client';

import { motion } from 'framer-motion';
import { Search, ShoppingCart, CreditCard, Truck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function HowToShop() {
  const steps = [
    {
      icon: <Search className="w-8 h-8 text-orange-600" />,
      title: '1. Find What You Need',
      description:
        'Explore thousands of products across categories — or use the search bar to find exactly what you’re looking for.',
    },
    {
      icon: <ShoppingCart className="w-8 h-8 text-orange-600" />,
      title: '2. Add to Cart',
      description:
        'Select your desired product, review its details, and click “Add to Cart”. You can continue shopping or proceed to checkout anytime.',
    },
    {
      icon: <CreditCard className="w-8 h-8 text-orange-600" />,
      title: '3. Checkout Securely',
      description:
        'Open your cart, review your order summary, and click “Checkout”. Choose your preferred payment option to continue.',
    },
    {
      icon: <Truck className="w-8 h-8 text-orange-600" />,
      title: '4. Provide Delivery Details',
      description:
        'Enter your accurate shipping address, contact information, and any delivery notes to ensure a smooth process.',
    },
    {
      icon: <CheckCircle2 className="w-8 h-8 text-orange-600" />,
      title: '5. Confirm & Receive Updates',
      description:
        'Once you confirm your order, you’ll receive an email confirmation and real-time updates on your delivery progress.',
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pt-28 pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center px-6 mb-12"
      >
        <h1 className="text-4xl font-extrabold text-orange-600 mb-3">
          How to Shop on NovaXmax
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Shopping with NovaXmax is easy, secure, and convenient. Follow these quick steps to get your
          favorite items delivered right to your doorstep.
        </p>
      </motion.div>

      {/* Steps */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white shadow-md hover:shadow-lg border border-gray-100 rounded-2xl p-6 transition"
          >
            <div className="flex items-center justify-center mb-4">{step.icon}</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">{step.title}</h3>
            <p className="text-gray-600 text-center leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-20 text-center px-6"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Start Shopping?</h2>
        <p className="text-gray-600 max-w-xl mx-auto mb-8">
          Discover amazing deals and trusted sellers across East Africa. Join thousands of happy shoppers
          who love NovaXmax for its reliability and convenience.
        </p>
        <Link
          href="/shops"
          className="inline-block bg-orange-600 text-white py-3 px-8 rounded-full font-medium hover:bg-orange-700 transition"
        >
          Explore Shops
        </Link>
      </motion.div>
    </div>
  );
}
