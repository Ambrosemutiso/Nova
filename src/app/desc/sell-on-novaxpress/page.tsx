'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import { FaBoxOpen, FaStore, FaTruck, FaUsers } from 'react-icons/fa';
import { CheckCircle } from 'lucide-react'

export default function SellOnNovaXpress({
  onOpenSellerLogin,
}: {
  onOpenSellerLogin: () => void;
}) {
  // 🧠 Mouse position tracking for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 2;
    const y = (e.clientY / innerHeight - 0.5) * 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  // Parallax transforms
  const boxX = useTransform(mouseX, (v) => v * 20);
  const boxY = useTransform(mouseY, (v) => v * 20);
  const storeX = useTransform(mouseX, (v) => v * -25);
  const storeY = useTransform(mouseY, (v) => v * 25);
  const truckX = useTransform(mouseX, (v) => v * 15);
  const truckY = useTransform(mouseY, (v) => v * -15);
  const usersX = useTransform(mouseX, (v) => v * -20);
  const usersY = useTransform(mouseY, (v) => v * -20);

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-100 text-gray-800 overflow-hidden pt-24 pb-16"
    >
      {/* 🌊 Animated Gradient Waves */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4, y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute -top-20 left-0 w-full h-64 bg-gradient-to-r from-orange-200 to-orange-400 rounded-full blur-3xl opacity-40"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4, y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 10 }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-orange-300 to-orange-100 rounded-full blur-3xl opacity-30"
      />

      {/* 🔘 Floating Parallax Icons */}
      <motion.div
        style={{ x: boxX, y: boxY }}
        animate={{ y: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
        className="absolute top-40 left-10 text-orange-400 opacity-30 text-6xl"
      >
        <FaBoxOpen />
      </motion.div>
      <motion.div
        style={{ x: storeX, y: storeY }}
        animate={{ y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="absolute top-60 right-12 text-orange-300 opacity-40 text-6xl"
      >
        <FaStore />
      </motion.div>
      <motion.div
        style={{ x: truckX, y: truckY }}
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 7 }}
        className="absolute bottom-24 left-20 text-orange-300 opacity-40 text-6xl"
      >
        <FaTruck />
      </motion.div>
      <motion.div
        style={{ x: usersX, y: usersY }}
        animate={{ y: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="absolute bottom-40 right-24 text-orange-300 opacity-40 text-6xl"
      >
        <FaUsers />
      </motion.div>

      {/* 🧭 Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto px-4 z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-orange-600 mb-4"
        >
          Start Selling on NovaXpress Today
        </motion.h1>
        <p className="text-gray-700 text-lg mb-6">
          Join thousands of successful entrepreneurs who are growing their businesses through NovaXpress.
          Whether you’re a small retailer, artisan, or large-scale distributor — our platform helps you reach
          customers nationwide.
        </p>
        <button
          onClick={onOpenSellerLogin}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-md"
        >
          Start Selling Now
        </button>
      </section>

      {/* 🖼️ Image + Features */}
      <section className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto px-6 mt-20 items-center z-10 relative">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src="/Seller-partner.jpg"
            alt="Seller dashboard preview"
            width={600}
            height={400}
            className="rounded-2xl shadow-lg"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-semibold text-orange-600 mb-4">Why Sell on NovaXpress?</h2>
<ul className="space-y-3 text-gray-700 leading-relaxed">
  <li className="flex items-center gap-2">
    <CheckCircle size={16} className="text-orange-500" />
    Reach thousands of active shoppers every day.
  </li>
  <li className="flex items-center gap-2">
    <CheckCircle size={16} className="text-orange-500" />
    Get real-time insights on your sales and performance.
  </li>
  <li className="flex items-center gap-2">
    <CheckCircle size={16} className="text-orange-500" />
    Flexible delivery options for your customers.
  </li>
  <li className="flex items-center gap-2">
    <CheckCircle size={16} className="text-orange-500" />
    Simple product upload & automatic stock management.
  </li>
  <li className="flex items-center gap-2">
    <CheckCircle size={16} className="text-orange-500" />
    Instant payouts directly to your wallet or bank.
  </li>
</ul>

        </motion.div>
      </section>

      {/* 📈 Growth Section */}
      <section className="bg-orange-50 py-16 mt-20 relative z-10">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-3xl font-bold text-orange-600 mb-2">10,000+</h3>
            <p className="text-gray-600">Active Sellers Nationwide</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-orange-600 mb-2">1M+</h3>
            <p className="text-gray-600">Monthly Visitors</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-orange-600 mb-2">24/7</h3>
            <p className="text-gray-600">Seller Support</p>
          </div>
        </div>
      </section>

      {/* 🪜 Steps Section */}
      <section className="max-w-6xl mx-auto px-6 mt-20 z-10 relative">
        <h2 className="text-2xl font-semibold text-center text-orange-600 mb-8">
          How to Get Started
        </h2>
        <div className="grid md:grid-cols-4 gap-6 text-center">
          {[
            { step: '1. Register', desc: 'Create your free seller account and set up your shop.' },
            { step: '2. Upload Products', desc: 'Add product details, images, and set your prices easily.' },
            { step: '3. Receive Orders', desc: 'Manage customer orders in your dashboard and ship promptly.' },
            { step: '4. Get Paid', desc: 'Receive payments quickly and grow your business!' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="p-6 bg-white border rounded-lg shadow hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold mb-2 text-orange-500">{item.step}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🚀 CTA */}
      <section className="text-center mt-20 z-10 relative">
        <h2 className="text-2xl md:text-3xl font-bold text-orange-600 mb-4">
          Ready to Grow Your Business?
        </h2>
        <p className="text-gray-700 mb-6">
          Join NovaXpress today and take your products to every corner of Kenya.
        </p>
        <button
          onClick={onOpenSellerLogin}
          className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-3 rounded-full text-lg font-semibold shadow-lg"
        >
          Start Selling Now
        </button>
      </section>
    </div>
  );
}
