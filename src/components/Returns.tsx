'use client';

import { motion } from 'framer-motion';
import { Package, RefreshCw, CreditCard, Clock, Mail, Truck } from 'lucide-react';

export default function ReturnsRefunds() {
  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 text-white py-24 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Refunds & Returns Policy</h1>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto">
            We want you to shop with confidence. Learn how NovaXmax handles refunds, exchanges, and returns.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-12 leading-relaxed">
        {/* 1. Overview */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">1. Our Commitment</h2>
          </div>
          <p className="text-gray-700">
            At NovaXmax, customer satisfaction is our top priority.  
            If you’re not fully satisfied with your purchase, we’ll do our best to make it right.  
            Our refund and return policy outlines how we handle returns, replacements, and reimbursements for eligible orders.
          </p>
        </motion.div>

        {/* 2. Return Eligibility */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">2. Return Eligibility</h2>
          </div>
          <p className="text-gray-700 mb-3">
            To be eligible for a return or exchange, items must meet the following conditions:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>The item must be unused, in its original packaging, and in the same condition you received it.</li>
            <li>Return requests must be submitted within <strong>7 days</strong> of delivery.</li>
            <li>Products such as personal care items, perishables, or intimate goods are not returnable for hygiene reasons.</li>
          </ul>
        </motion.div>

        {/* 3. Refunds */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">3. Refund Process</h2>
          </div>
          <p className="text-gray-700 mb-3">
            Once your return is received and inspected, we’ll notify you by email regarding the status of your refund.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>If approved, your refund will be processed within <strong>5–10 business days</strong>.</li>
            <li>Refunds will be credited to your original payment method (mobile money, debit card, or NovaXmax wallet).</li>
            <li>Shipping fees are non-refundable unless the return is due to an error or defective item.</li>
          </ul>
        </motion.div>

        {/* 4. Exchanges */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Truck className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">4. Exchanges</h2>
          </div>
          <p className="text-gray-700">
            If your item arrives damaged or defective, you may request an exchange for the same product or a replacement item.
            NovaXmax sellers are required to handle replacements promptly to maintain high buyer satisfaction.
          </p>
        </motion.div>

        {/* 5. Timelines & Exceptions */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">5. Timelines & Exceptions</h2>
          </div>
          <p className="text-gray-700 mb-3">
            Please note that refund and return timelines may vary depending on:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>The seller’s location and return logistics.</li>
            <li>Payment method and banking processes.</li>
            <li>Verification of returned item condition.</li>
          </ul>
          <p className="mt-3 text-gray-700">
            Items marked as <strong>Final Sale</strong> or <strong>Non-Returnable</strong> are not eligible for refunds.
          </p>
        </motion.div>

        {/* 6. Contact */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">6. Need Assistance?</h2>
          </div>
          <p className="text-gray-700">
            For support or refund-related queries, contact our team at{' '}
            <a
              href="mailto:support@novaxmax.com"
              className="text-orange-500 font-medium hover:underline"
            >
              support@novaxmax.com
            </a>.  
            Our support agents will respond within 24 hours.
          </p>
        </motion.div>
      </section>

      {/* Footer CTA */}
      <section className="bg-orange-500 text-white text-center py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Shop with Confidence</h2>
          <p className="text-lg mb-8">
            At NovaXmax, every order is backed by our trusted refund and return policy.
            Your satisfaction means everything to us.
          </p>
          <a
            href="/"
            className="inline-block bg-white text-orange-600 font-semibold py-3 px-8 rounded-full shadow hover:bg-gray-100 transition"
          >
            Return to Home
          </a>
        </div>
      </section>
    </div>
  );
}
