'use client';

import { motion } from 'framer-motion';
import { Store, Scale, CheckCircle, ShieldAlert, DollarSign, FileText } from 'lucide-react';

export default function SellerPolicy() {
  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 text-white py-24 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Seller Policy & Code of Conduct</h1>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto">
            At NovaXmax, we empower sellers to succeed — while maintaining fairness, trust, and transparency for every customer.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-12 leading-relaxed">
        {/* 1. Purpose */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Store className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">1. Purpose of this Policy</h2>
          </div>
          <p className="text-gray-700">
            This Seller Policy outlines the standards, responsibilities, and guidelines for all sellers operating on NovaXmax.
            By registering as a seller, you agree to uphold the highest standards of honesty, product quality, and customer service.
          </p>
        </motion.div>

        {/* 2. Seller Responsibilities */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">2. Seller Responsibilities</h2>
          </div>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Provide accurate and up-to-date product descriptions, images, and pricing.</li>
            <li>Ensure timely order processing, packaging, and shipping.</li>
            <li>Respond promptly and respectfully to buyer inquiries.</li>
            <li>Comply with all NovaXmax platform policies and local business regulations.</li>
          </ul>
        </motion.div>

        {/* 3. Product Authenticity & Quality */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">3. Product Authenticity & Quality Standards</h2>
          </div>
          <p className="text-gray-700 mb-3">
            Sellers must only list genuine and legally obtained products. Counterfeit, replica, or misrepresented items are strictly prohibited.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>All items must meet advertised specifications.</li>
            <li>Product images should be accurate and free of misleading edits.</li>
            <li>Quality issues or false claims may result in listing suspension or account removal.</li>
          </ul>
        </motion.div>

        {/* 4. Fair Pricing & Transparency */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">4. Fair Pricing & Transparency</h2>
          </div>
          <p className="text-gray-700">
            Sellers must offer fair, competitive pricing without hidden costs. False discounts, misleading promotions, or price
            inflation are not tolerated.
          </p>
        </motion.div>

        {/* 5. Payments & Fees */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">5. Payments, Fees & Settlements</h2>
          </div>
          <p className="text-gray-700">
            NovaXmax handles payments securely and transparently. Sellers receive payouts after order confirmation and verification.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
            <li>Platform fees and commissions are communicated upfront.</li>
            <li>Any fraudulent or chargeback-related activity will be reviewed and may affect payouts.</li>
            <li>All transactions must comply with local financial regulations.</li>
          </ul>
        </motion.div>

        {/* 6. Communication & Customer Service */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">6. Communication & Professional Conduct</h2>
          </div>
          <p className="text-gray-700">
            All sellers are expected to maintain respectful and professional communication with buyers and NovaXpress support staff.
            Abusive, discriminatory, or unprofessional behavior is not tolerated.
          </p>
        </motion.div>

        {/* 7. Violations & Enforcement */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">7. Violations & Account Enforcement</h2>
          </div>
          <p className="text-gray-700">
            Violating NovaXmax policies may result in warnings, temporary restrictions, listing removals, or permanent account
            suspension. Repeat offenses or fraudulent activity may lead to legal action.
          </p>
        </motion.div>
      </section>

      {/* Footer CTA */}
      <section className="bg-orange-600 text-white text-center py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Sell with Confidence. Build with Integrity.</h2>
          <p className="text-lg mb-8">
            NovaXmax is built on trust. Follow our Seller Code of Conduct to grow your business sustainably and responsibly.
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
