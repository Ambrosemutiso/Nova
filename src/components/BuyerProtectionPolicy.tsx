'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Lock, DollarSign, HelpCircle, PackageCheck, Headphones } from 'lucide-react';

export default function BuyerProtectionPolicy() {
  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 text-white py-24 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Buyer Protection & Safety Policy</h1>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto">
            At NovaXmax, your trust and safety come first. Our Buyer Protection Policy ensures you shop with total confidence.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-12 leading-relaxed">
        {/* 1. Our Commitment */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">1. Our Commitment to Buyer Safety</h2>
          </div>
          <p className="text-gray-700">
            NovaXmax guarantees a secure and transparent shopping environment. We ensure that every transaction, from order
            placement to delivery, is protected against fraud, misrepresentation, and unauthorized use. Our mission is to make
            online shopping as safe as it is enjoyable.
          </p>
        </motion.div>

        {/* 2. Secure Payments */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">2. Secure & Verified Payments</h2>
          </div>
          <p className="text-gray-700 mb-3">
            All payments on NovaXmax are processed through verified, encrypted gateways. We never store sensitive payment
            details like card numbers or banking credentials.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Payment verification helps protect against unauthorized transactions.</li>
            <li>NovaXmax may hold funds temporarily until a transaction is confirmed successful.</li>
            <li>Refunds are processed through the same secure channels.</li>
          </ul>
        </motion.div>

        {/* 3. Authentic Sellers & Products */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <PackageCheck className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">3. Authentic Sellers & Verified Listings</h2>
          </div>
          <p className="text-gray-700">
            We thoroughly review sellers before they list products on NovaXmax. Only verified sellers are allowed to operate,
            ensuring genuine listings and trustworthy experiences.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
            <li>Counterfeit or misrepresented items are strictly prohibited.</li>
            <li>Sellers who violate authenticity rules may be permanently suspended.</li>
            <li>Buyers can report suspicious activity directly from the product page.</li>
          </ul>
        </motion.div>

        {/* 4. Refunds & Resolutions */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">4. Refunds & Dispute Resolution</h2>
          </div>
          <p className="text-gray-700 mb-3">
            In case of damaged, missing, or incorrect items, buyers can file a dispute within the allowed return window.
            NovaXmax mediates disputes fairly to ensure both parties reach a satisfactory resolution.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Refunds are issued once the issue is verified.</li>
            <li>Buyers must provide clear evidence (photos, order number, communication records).</li>
            <li>Most cases are resolved within 5–7 business days.</li>
          </ul>
        </motion.div>

        {/* 5. Reporting & Support */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">5. Reporting & Support</h2>
          </div>
          <p className="text-gray-700">
            We encourage buyers to report any unethical activity, fake listings, or seller misconduct.  
            NovaXmax actively monitors reports to maintain transparency and safety across the marketplace.
          </p>
        </motion.div>

        {/* 6. Dedicated Assistance */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Headphones className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">6. Need Help?</h2>
          </div>
          <p className="text-gray-700">
            Our Buyer Protection team is available 7 days a week.  
            Reach us via{' '}
            <a
              href="mailto:support@novaxmax.com"
              className="text-orange-500 font-medium hover:underline"
            >
              support@novaxmax.com
            </a>{' '}
            for any concerns, claims, or general questions.
          </p>
        </motion.div>
      </section>

      {/* Footer CTA */}
      <section className="bg-orange-500 text-white text-center py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Shop Confidently. We’ve Got You Covered.</h2>
          <p className="text-lg mb-8">
            From payment protection to verified sellers, NovaXmax ensures a safe and trustworthy shopping experience for every buyer.
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
