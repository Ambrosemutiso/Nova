'use client';

import { motion } from 'framer-motion';

export default function AboutNovaXpress() {
  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 text-white py-24 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            About <span className="text-white">NovaXmax</span>
          </h1>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto">
            Empowering East Africa’s digital marketplace — connecting buyers and sellers across Kenya,
            Uganda, Tanzania, Rwanda, Ethiopia, South Sudan, and Somalia.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <motion.img
          src="/about-illustration.jpg"
          alt="NovaXpress Marketplace"
          className="rounded-2xl shadow-md w-full object-cover"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        />
        <div>
          <h2 className="text-3xl font-bold text-orange-600 mb-4">Who We Are</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            NovaXmax is a next-generation multi-vendor eCommerce platform built to enable seamless
            buying and selling across East Africa. We bring together individuals, entrepreneurs, and
            businesses — providing the digital tools and infrastructure needed to thrive online.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Our mission is simple: to make online commerce more accessible, affordable, and reliable for
            everyone — from local artisans and startups to large-scale retailers. NovaXpress gives every
            seller the chance to reach new audiences and scale beyond borders.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-orange-600 mb-10">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Empowerment',
                text: 'We equip sellers with the tools, visibility, and insights to grow their businesses regionally and globally.',
              },
              {
                title: 'Trust & Security',
                text: 'We prioritize safe transactions, verified vendors, and reliable delivery systems to ensure confidence on every purchase.',
              },
              {
                title: 'Innovation',
                text: 'We continuously evolve our platform to improve user experience, introduce smart features, and simplify trade.',
              },
              {
                title: 'Accessibility',
                text: 'NovaXmax is designed for everyone — intuitive, mobile-friendly, and inclusive for users across different regions.',
              },
              {
                title: 'Community Growth',
                text: 'We believe in collaboration, supporting local economies, and building a thriving East African eCommerce ecosystem.',
              },
              {
                title: 'Customer Experience',
                text: 'Every feature we build aims to make shopping and selling smoother, faster, and more enjoyable.',
              },
            ].map((val, i) => (
              <motion.div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {val.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{val.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-orange-600 mb-4">Our Vision</h2>
        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
          To become world leading online marketplace — where technology, trust, and opportunity
          meet to empower millions of digital entrepreneurs and simplify shopping for everyone.
        </p>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-500 text-white py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Join the NovaXmax Community</h2>
          <p className="text-lg mb-8">
            Whether you’re a seller looking to expand your reach or a buyer searching for trusted products,
            NovaXpress is your gateway to a smarter, digital economy.
          </p>
          <a
            href="/desc/sell-on-novaxmax"
            className="inline-block bg-white text-orange-600 font-semibold py-3 px-8 rounded-full shadow hover:bg-gray-100 transition"
          >
            Start Selling Today
          </a>
        </div>
      </section>
    </div>
  );
}
