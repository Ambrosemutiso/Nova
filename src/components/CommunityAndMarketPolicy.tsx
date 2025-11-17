'use client';

import { motion } from 'framer-motion';
import { Users, HeartHandshake, ShieldCheck, Globe2, Star, MessageSquareHeart } from 'lucide-react';

export default function CommunityEthics() {
  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 text-white py-24 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Community & Marketplace Ethics
          </h1>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto">
            Building trust, respect, and opportunity across East Africa — where every transaction means connection, growth, and impact.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-12 leading-relaxed">
        {/* Our Commitment */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <HeartHandshake className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">1. Our Commitment to Fair Commerce</h2>
          </div>
          <p className="text-gray-700">
            NovaXmax stands for fairness and transparency. We ensure that buyers and sellers operate within a space built on honesty,
            integrity, and mutual respect. Every user is treated equally — regardless of location, background, or business size.
          </p>
        </motion.div>

        {/* Inclusivity & Opportunity */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Globe2 className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">2. Inclusivity & Equal Opportunity</h2>
          </div>
          <p className="text-gray-700">
            We celebrate diversity and believe everyone deserves access to opportunity. NovaXmax encourages sellers from every
            background — from small rural entrepreneurs to large brands — to participate and thrive in the digital economy.
          </p>
        </motion.div>

        {/* Integrity in Transactions */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">3. Integrity in Every Transaction</h2>
          </div>
          <p className="text-gray-700">
            Trust is the foundation of NovaXmax. We promote authentic listings, clear communication, and reliable fulfillment.
            Fraudulent behavior, misinformation, or exploitation will not be tolerated and may result in account suspension.
          </p>
        </motion.div>

        {/* Respect & Communication */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <MessageSquareHeart className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">4. Respect & Responsible Communication</h2>
          </div>
          <p className="text-gray-700">
            We expect all members of the NovaXmax community to engage respectfully. Discrimination, hate speech, harassment, or
            intimidation have no place on our platform. Our support team is available to handle reports of misconduct quickly and fairly.
          </p>
        </motion.div>

        {/* Sustainability & Local Impact */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">5. Sustainability & Local Empowerment</h2>
          </div>
          <p className="text-gray-700">
            We’re committed to supporting sustainable businesses and promoting local growth. By choosing NovaXmax, you help build
            stronger economies and empower communities across East Africa.
          </p>
        </motion.div>

        {/* Shared Growth */}
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">6. Shared Growth & Collaboration</h2>
          </div>
          <p className="text-gray-700">
            NovaXmax thrives on collaboration. We continuously work with sellers, buyers, and partners to improve the marketplace,
            innovate, and share success stories that inspire more people to join the digital economy.
          </p>
        </motion.div>
      </section>

      {/* Footer CTA */}
      <section className="bg-orange-600 text-white text-center py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Together, We Build a Trusted Marketplace</h2>
          <p className="text-lg mb-8">
            NovaXmax isn’t just an online store — it’s a movement for ethical commerce and community empowerment.
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
