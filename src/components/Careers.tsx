'use client';

import { motion } from 'framer-motion';
import { Briefcase, Users, Lightbulb, Rocket, HeartHandshake } from 'lucide-react';

export default function Careers() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-10">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 text-white py-24 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Careers at <span className="text-white">NovaXmax</span>
          </h1>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto">
            Be part of the team shaping the future of eCommerce across East Africa — empowering sellers and connecting communities through technology.
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <motion.img
          src="/careers.jpg"
          alt="NovaXmax Careers"
          className="rounded-2xl shadow-md w-full object-cover"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        />
        <div>
          <h2 className="text-3xl font-bold text-orange-600 mb-4">Join Our Mission</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            At NovaXmax, we’re not just building an online store — we’re redefining how East Africa buys,
            sells, and grows digitally. Our mission is to empower entrepreneurs and deliver exceptional value
            to customers through technology, creativity, and collaboration.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We’re looking for bold thinkers, builders, and problem-solvers who share our passion for innovation.
            If you love challenges, thrive in fast-paced environments, and believe in making a real impact, NovaXmax is the place for you.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-orange-600 mb-10">Why Work With Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Innovation',
                icon: <Lightbulb className="w-8 h-8 text-orange-500 mb-3 mx-auto" />,
                text: 'We encourage creative ideas and value bold solutions that drive change in eCommerce.',
              },
              {
                title: 'Team Spirit',
                icon: <Users className="w-8 h-8 text-orange-500 mb-3 mx-auto" />,
                text: 'Work alongside passionate individuals who believe in collaboration over competition.',
              },
              {
                title: 'Career Growth',
                icon: <Rocket className="w-8 h-8 text-orange-500 mb-3 mx-auto" />,
                text: 'Grow your career with mentorship, learning opportunities, and room to innovate.',
              },
              {
                title: 'Purpose',
                icon: <HeartHandshake className="w-8 h-8 text-orange-500 mb-3 mx-auto" />,
                text: 'Be part of something bigger — empowering small businesses and shaping the digital economy.',
              },
              {
                title: 'Impact',
                icon: <Briefcase className="w-8 h-8 text-orange-500 mb-3 mx-auto" />,
                text: 'Every line of code, every design, every campaign contributes to real-world change.',
              },
              {
                title: 'Inclusivity',
                icon: <Users className="w-8 h-8 text-orange-500 mb-3 mx-auto" />,
                text: 'We celebrate diversity and welcome people from all walks of life to build with us.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {item.icon}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Openings Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-orange-600 mb-4">Open Positions</h2>
        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-8">
          We’re growing fast — and we’d love for you to grow with us. Explore our latest openings below.
          If you don’t see a role that fits, feel free to reach out; we’re always on the lookout for exceptional talent.
        </p>
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-10 text-gray-500">
          <p>No open positions at the moment. Please check back soon or email your resume to <a href="mailto:careers@novaxmax.com" className="text-orange-500 font-medium hover:underline">careers@novaxmax.com</a>.</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-500 text-white py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Build the Future with NovaXmax</h2>
          <p className="text-lg mb-8">
            Whether you’re a developer, marketer, designer, or strategist — your ideas can shape East Africa’s
            next digital frontier.
          </p>
          <a
            href="mailto:careers@novaxmax.com"
            className="inline-block bg-white text-orange-600 font-semibold py-3 px-8 rounded-full shadow hover:bg-gray-100 transition"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
    </div>
  );
}
