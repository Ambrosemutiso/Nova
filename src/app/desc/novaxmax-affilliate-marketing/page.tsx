'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { FaMoneyBillWave, FaUserFriends, FaChartLine, FaLink } from 'react-icons/fa';
import { CheckCircle } from 'lucide-react';

export default function AffiliateLanding() {
  const [showModal, setShowModal] = useState(false);
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // 🎯 Parallax mouse effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 2;
    const y = (e.clientY / innerHeight - 0.5) * 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const linkX = useTransform(mouseX, (v) => v * 15);
  const linkY = useTransform(mouseY, (v) => v * 15);
  const moneyX = useTransform(mouseX, (v) => v * -20);
  const moneyY = useTransform(mouseY, (v) => v * -20);
  const chartX = useTransform(mouseX, (v) => v * 10);
  const chartY = useTransform(mouseY, (v) => v * -10);
  const friendsX = useTransform(mouseX, (v) => v * -15);
  const friendsY = useTransform(mouseY, (v) => v * 15);

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-white text-gray-800 overflow-hidden pt-24 pb-16"
    >
      {/* 🔶 Floating Parallax Icons */}
      <motion.div style={{ x: linkX, y: linkY, rotate: 10 }} className="absolute top-40 left-10 text-orange-400 opacity-30 text-6xl">
        <FaLink />
      </motion.div>
      <motion.div style={{ x: moneyX, y: moneyY, rotate: -8 }} className="absolute top-60 right-16 text-orange-300 opacity-40 text-6xl">
        <FaMoneyBillWave />
      </motion.div>
      <motion.div style={{ x: chartX, y: chartY, rotate: 5 }} className="absolute bottom-24 left-20 text-orange-300 opacity-40 text-6xl">
        <FaChartLine />
      </motion.div>
      <motion.div style={{ x: friendsX, y: friendsY, rotate: -6 }} className="absolute bottom-32 right-28 text-orange-300 opacity-40 text-6xl">
        <FaUserFriends />
      </motion.div>

      {/* 🧭 Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 z-10 relative">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-orange-600 mb-4"
        >
          Become a NovaXmax Affiliate
        </motion.h1>
        <p className="text-gray-700 text-lg mb-6">
          Earn money by sharing products you love! Promote NovaXmax items across social media and earn up to <b>10% commission</b> for every purchase made through your referral link.
        </p>
        <button
          onClick={handleOpenModal}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-md"
        >
          Join the Affiliate Program
        </button>
      </section>

      {/* 💼 Image + Perks */}
      <section className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto px-6 mt-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src="/Affiliate-dashboard.jpg"
            alt="Affiliate dashboard"
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
          <h2 className="text-2xl font-semibold text-orange-600 mb-4">Why Join NovaXmax Affiliates?</h2>
          <ul className="space-y-3 text-gray-700 leading-relaxed">
            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-orange-500" /> Earn up to <b>10% commission</b> on every successful referral.</li>
            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-orange-500" /> Track your clicks, sales, and earnings in real-time.</li>
            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-orange-500" /> Share your personalized affiliate links anywhere — social media, blogs, or WhatsApp.</li>
            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-orange-500" /> Withdraw your earnings instantly to your wallet or M-Pesa.</li>
            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-orange-500" /> Work with brands and grow your personal influence.</li>
          </ul>
        </motion.div>
      </section>

            {/* 📈 Growth Section */}
      <section className="bg-orange-50 py-16 mt-20 relative z-10">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-3xl font-bold text-orange-600 mb-2">100K+</h3>
            <p className="text-gray-600">Active Affiliates Nationwide</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-orange-600 mb-2">1M+</h3>
            <p className="text-gray-600">Monthly payments</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-orange-600 mb-2">100K+</h3>
            <p className="text-gray-600">Paid Daily</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-orange-600 mb-2">24/7</h3>
            <p className="text-gray-600">Affiliate Support</p>
          </div>
        </div>
      </section>

      {/* 📈 Steps Section */}
      <section className="bg-orange-50 py-16 mt-20">
        <h2 className="text-2xl font-semibold text-center text-orange-600 mb-10">
          How It Works
        </h2>
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto px-6 text-center">
          {[
            { step: '1. Register', desc: 'Create your free affiliate account.' },
            { step: '2. Get Links', desc: 'Copy your unique referral links from your dashboard.' },
            { step: '3. Promote', desc: 'Share products on social media and attract buyers.' },
            { step: '4. Earn', desc: 'Earn commissions every time someone buys through your link.' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="p-6 bg-white border rounded-xl shadow hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold mb-2 text-orange-500">{item.step}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🚀 Call to Action */}
      <section className="text-center mt-20 px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-orange-600 mb-4">
          Start Earning From Your Influence
        </h2>
        <p className="text-gray-700 mb-6">
          Join the NovaXmax Affiliate Program today and turn your content into cash.
        </p>
        <button
          onClick={handleOpenModal}
          className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-3 rounded-full text-lg font-semibold shadow-lg"
        >
          Join Now
        </button>
      </section>

      {/* 💬 Popup Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg w-96 relative text-center">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-lg"
            >
              ×
            </button>
            <h3 className="text-xl font-semibold mb-3 text-orange-600">Join NovaXmax Affiliates</h3>
            <p className="text-gray-600 mb-5">
              Log in or create an affiliate account to start earning commissions.
            </p>
            <button
              onClick={() => {
                handleCloseModal();
                window.location.href = '/affiliate/auth/login';
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-full font-semibold"
            >
              Continue to Affiliate Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
