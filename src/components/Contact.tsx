'use client';

import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactUs() {
  return (
    <div className="bg-gray-50 min-h-screen pt-28 pb-20">
      {/* Header Section */}
      <section className="text-center px-6 mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-orange-600 mb-3"
        >
          Get in Touch
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-gray-600 max-w-2xl mx-auto text-lg"
        >
          Have a question, need support, or want to partner with us? We’re always happy to hear from you.
          Our team is here to ensure your NovaXpress experience runs smoothly.
        </motion.p>
      </section>

      {/* Contact Info + Form */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 px-6">
        {/* Contact Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-md rounded-2xl p-8 border border-gray-100"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Reach Us Directly</h2>
          <ul className="space-y-5 text-gray-700">
            <li className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-orange-500 mt-1" />
              <div>
                <strong>Email:</strong>
                <p>support@novaxmax.com</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-orange-500 mt-1" />
              <div>
                <strong>Phone:</strong>
                <p>+254 798 437 508</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-orange-500 mt-1" />
              <div>
                <strong>Live Chat:</strong>
                <p>Available Monday–Saturday, 9am – 6pm</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-orange-500 mt-1" />
              <div>
                <strong>Location:</strong>
                <p>NovaXmax HQ, Nairobi, Kenya</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-orange-500 mt-1" />
              <div>
                <strong>Support Hours:</strong>
                <p>Mon–Sat: 9:00am – 6:00pm</p>
              </div>
            </li>
          </ul>
        </motion.div>

        {/* Contact Form */}
        <motion.form
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-md rounded-2xl p-8 border border-gray-100"
          onSubmit={(e) => {
            e.preventDefault();
            alert('Thank you! Your message has been received.');
          }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Send Us a Message</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">Full Name</label>
              <input
                type="text"
                required
                placeholder="Your Name"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-gray-700 mb-2 text-sm font-medium">Subject</label>
            <input
              type="text"
              required
              placeholder="How can we help you?"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div className="mt-5">
            <label className="block text-gray-700 mb-2 text-sm font-medium">Message</label>
            <textarea
              required
              rows={5}
              placeholder="Write your message here..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none"
            ></textarea>
          </div>

          <button
            type="submit"
            className="mt-6 w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Send Message
          </button>
        </motion.form>
      </div>

      {/* Map / CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-20 text-center px-6"
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-4">We’re Here for You</h3>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Whether it’s feedback, partnership, or technical support — NovaXpress is just one message away.
        </p>
        <a
          href="mailto:support@novaxmax.com"
          className="inline-block bg-orange-600 text-white py-3 px-8 rounded-full font-medium hover:bg-orange-700 transition"
        >
          Email Us Now
        </a>
      </motion.div>
    </div>
  );
}
