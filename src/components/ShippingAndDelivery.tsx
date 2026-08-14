'use client';

import { motion } from 'framer-motion';
import { Truck, Globe, Clock, Package, MapPin, Mail } from 'lucide-react';

export default function ShippingAndDelivery() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-10">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 text-white py-24 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Shipping & Delivery Policy</h1>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto">
            NovaXmax ensures your orders are delivered safely, quickly, and affordably across East Africa.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-12 leading-relaxed">
        {/* 1. Coverage */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">1. Delivery Coverage</h2>
          </div>
          <p className="text-gray-700">
            NovaXmax operates across <strong>Kenya, Uganda, Tanzania, Rwanda, Ethiopia, South Sudan, and Somalia</strong>.
            Depending on the seller’s location, delivery times may vary.  
            We partner with trusted regional couriers and independent vendors to ensure smooth and timely delivery.
          </p>
        </motion.div>

        {/* 2. Delivery Timelines */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">2. Delivery Timelines</h2>
          </div>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Local Deliveries (within the same country):</strong> Typically may take 1–3 business days.</li>
            <li><strong>Cross-Border Deliveries (between East African countries):</strong> Usually delivered within 5–10 business days.</li>
            <li>Public holidays and remote area deliveries may slightly extend the timeline.</li>
          </ul>
        </motion.div>

        {/* 3. Shipping Fees */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Truck className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">3. Shipping Fees</h2>
          </div>
          <p className="text-gray-700 mb-3">
            Shipping costs are calculated based on the seller’s location, delivery destination, and parcel weight.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Some sellers may offer free delivery for specific products or minimum order values.</li>
            <li>Buyers will always see the exact shipping cost before confirming checkout.</li>
            <li>In cases of combined orders from multiple sellers, shipping may be split into multiple deliveries.</li>
          </ul>
        </motion.div>

        {/* 4. Order Tracking */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">4. Order Tracking</h2>
          </div>
          <p className="text-gray-700">
            Once your order is shipped, you’ll receive a tracking link or code via email or SMS.  
            You can monitor your order’s progress directly through your NovaXmax account or the courier’s tracking system.
          </p>
        </motion.div>

        {/* 5. Handling Delays & Lost Packages */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">5. Delays & Lost Packages</h2>
          </div>
          <p className="text-gray-700 mb-3">
            While delays are rare, they may occur due to customs, weather, or courier issues.  
            In such cases, we’ll keep you updated throughout the process.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>If your package is lost or severely delayed, NovaXmax will investigate and assist with replacement or refund procedures.</li>
            <li>We encourage buyers to ensure accurate shipping details to avoid delivery issues.</li>
          </ul>
        </motion.div>

        {/* 6. Support */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">6. Need Help?</h2>
          </div>
          <p className="text-gray-700">
            For questions regarding your shipment or delivery updates, reach out to our logistics support team at{' '}
            <a
              href="mailto:support@novaxmax.com"
              className="text-orange-500 font-medium hover:underline"
            >
              support@novaxmax.com
            </a>.  
            Our team is available 7 days a week to assist with any shipping-related concerns.
          </p>
        </motion.div>
      </section>

      {/* Footer CTA */}
      <section className="bg-orange-500 text-white text-center py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Fast, Reliable & Transparent</h2>
          <p className="text-lg mb-8">
            At NovaXmax, every delivery is handled with care and efficiency.  
            Shop with peace of mind knowing your orders are always in safe hands.
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
    </div>
  );
}
