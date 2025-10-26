'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import { FaTruck, FaMapMarkedAlt, FaHandshake} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function PartnerWithNovaXpress() {
  const router = useRouter();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 2;
    const y = (e.clientY / innerHeight - 0.5) * 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const truckX = useTransform(mouseX, (v) => v * 25);
  const truckY = useTransform(mouseY, (v) => v * -20);
  const mapX = useTransform(mouseX, (v) => v * -20);
  const mapY = useTransform(mouseY, (v) => v * 20);
  const handshakeX = useTransform(mouseX, (v) => v * 15);
  const handshakeY = useTransform(mouseY, (v) => v * -15);

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-100 text-gray-800 overflow-hidden pt-24 pb-16"
    >
      {/* 🌀 Background gradients */}
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3], y: [0, 25, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute -top-20 left-0 w-full h-64 bg-gradient-to-r from-orange-200 to-orange-400 rounded-full blur-3xl opacity-30"
      ></motion.div>
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2], y: [0, -25, 0] }}
        transition={{ repeat: Infinity, duration: 10 }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-orange-300 to-orange-100 rounded-full blur-3xl opacity-30"
      ></motion.div>

      {/* 🚛 Floating Parallax Icons */}
      <motion.div
        style={{ x: truckX, y: truckY }}
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
        className="absolute top-40 left-10 text-orange-400 opacity-40 text-6xl"
      >
        <FaTruck />
      </motion.div>
      <motion.div
        style={{ x: mapX, y: mapY }}
        animate={{ y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="absolute top-60 right-12 text-orange-300 opacity-40 text-6xl"
      >
        <FaMapMarkedAlt />
      </motion.div>
      <motion.div
        style={{ x: handshakeX, y: handshakeY }}
        animate={{ y: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 7 }}
        className="absolute bottom-40 right-20 text-orange-300 opacity-40 text-6xl"
      >
        <FaHandshake />
      </motion.div>

      {/* 🧭 Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto px-4 z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-orange-600 mb-4"
        >
          Partner With NovaXpress Logistics
        </motion.h1>
        <p className="text-gray-700 text-lg mb-6">
          Join our growing network of trusted logistics companies and help us deliver smiles across Kenya. 
          Whether you’re an established courier or a regional transporter — let’s move together.
        </p>
        <button
           onClick={() => router.push('/logistics/auth/login')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-md"
        >
          Become a Partner
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
            src="/Logistics-partner.jpg"
            alt="Logistics partnership"
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
          <h2 className="text-2xl font-semibold text-orange-600 mb-4">
            Why Partner With NovaXpress?
          </h2>
          <ul className="space-y-3 text-gray-700 leading-relaxed">
            <li><CheckCircle size={16} className="text-orange-500" /> Get access to a large marketplace of delivery requests daily.</li>
            <li><CheckCircle size={16} className="text-orange-500" /> Seamless tracking and automated pickup assignments.</li>
            <li><CheckCircle size={16} className="text-orange-500" /> Transparent payments and fast settlements.</li>
            <li><CheckCircle size={16} className="text-orange-500" /> Nationwide coverage and county-level control.</li>
            <li><CheckCircle size={16} className="text-orange-500" /> Dedicated logistics dashboard for operations.</li>
          </ul>
        </motion.div>
      </section>

      {/* 📦 Stats Section */}
      <section className="bg-orange-50 py-16 mt-20 relative z-10">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-3xl font-bold text-orange-600 mb-2">5,000+</h3>
            <p className="text-gray-600">Deliveries per day</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-orange-600 mb-2">80+</h3>
            <p className="text-gray-600">Partner Companies</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-orange-600 mb-2">100%</h3>
            <p className="text-gray-600">Payment Transparency</p>
          </div>
        </div>
      </section>

      {/* 🪜 Steps Section */}
      <section className="max-w-6xl mx-auto px-6 mt-20 z-10 relative">
        <h2 className="text-2xl font-semibold text-center text-orange-600 mb-8">
          How to Join Our Network
        </h2>
        <div className="grid md:grid-cols-4 gap-6 text-center">
          {[
            { step: '1. Register', desc: 'Create your logistics partner account.' },
            { step: '2. Verify', desc: 'Submit company and vehicle details for approval.' },
            { step: '3. Accept Deliveries', desc: 'Receive delivery tasks automatically on your dashboard.' },
            { step: '4. Earn', desc: 'Get paid instantly after successful deliveries.' },
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
          Ready to Move With Us?
        </h2>
        <p className="text-gray-700 mb-6">
          Partner with NovaXpress and be part of the logistics revolution connecting businesses to customers nationwide.
        </p>
        <button
           onClick={() => router.push('/logistics/auth/login')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-3 rounded-full text-lg font-semibold shadow-lg"
        >
          Become a Partner
        </button>
      </section>
    </div>
  );
}
