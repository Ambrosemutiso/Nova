'use client';

import { motion } from 'framer-motion';
import { PackageSearch, ClipboardCheck, Truck, Headset, Search } from 'lucide-react';

export default function TrackOrder() {
  const steps = [
    {
      icon: <ClipboardCheck className="w-8 h-8 text-orange-600" />,
      title: '1. Order Confirmation',
      description:
        'Once you place your order, you’ll receive a confirmation email or SMS with your unique order ID.',
    },
    {
      icon: <PackageSearch className="w-8 h-8 text-orange-600" />,
      title: '2. Track Progress',
      description:
        'Enter your order ID below to check your delivery status — from packaging to dispatch.',
    },
    {
      icon: <Truck className="w-8 h-8 text-orange-600" />,
      title: '3. Delivery Updates',
      description:
        'You’ll receive real-time updates on your order’s journey until it arrives safely at your doorstep.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-10">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center px-6 mb-12"
      >
        <h1 className="text-4xl font-extrabold text-orange-600 mb-3">
          Track Your Order
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Stay informed about your NovaXmax orders in real-time. Enter your order ID to track your
          package and view its latest status.
        </p>
      </motion.div>

      {/* Order Tracking Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="max-w-md mx-auto bg-white shadow-md rounded-2xl border border-gray-100 p-6 mb-16"
      >
        <form className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="Enter your Order ID"
            className="w-full flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none text-gray-700"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-orange-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-orange-700 transition w-full sm:w-auto"
          >
            <Search className="w-5 h-5" />
            Track
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-3 text-center">
          You can also log into your NovaXmax account to track multiple orders.
        </p>
      </motion.div>

      {/* Tracking Steps */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white border border-gray-100 rounded-2xl shadow-md hover:shadow-lg p-6 text-center transition"
          >
            <div className="flex items-center justify-center mb-4">{step.icon}</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{step.title}</h3>
            <p className="text-gray-600 leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Support CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center mt-20 px-6"
      >
        <Headset className="w-10 h-10 text-orange-600 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Need Help with Your Order?
        </h2>
        <p className="text-gray-600 mb-6">
          If you’re unable to find your order or need assistance, contact our support team with your order number.
        </p>
        <a
          href="mailto:support@novaxmax.com"
          className="inline-block bg-orange-600 text-white py-3 px-8 rounded-full font-medium hover:bg-orange-700 transition"
        >
          Contact Support
        </a>
      </motion.div>
    </div>
    </div>
  );
}
