'use client';

import { Lock, Shield, Eye, Mail, Database, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 text-white py-24 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Privacy Policy</h1>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto">
            Your privacy matters to us. This policy explains how NovaXpress collects, uses, and protects your information.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-12 leading-relaxed">
        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">1. Information We Collect</h2>
          </div>
          <p className="text-gray-700 mb-3">
            To deliver a smooth and personalized experience, NovaXpress collects information that helps us serve you better, such as:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Personal details — your name, email address, phone number, and shipping information.</li>
            <li>Account credentials and login details (securely encrypted).</li>
            <li>Purchase and browsing history to improve recommendations.</li>
            <li>Device, browser, and location data for analytics and fraud prevention.</li>
          </ul>
        </motion.div>

        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">2. How We Use Your Information</h2>
          </div>
          <p className="text-gray-700 mb-3">
            We use your data responsibly — only for the purpose of enhancing your experience and operating the platform. This includes:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Processing and delivering your orders efficiently.</li>
            <li>Improving our services, user experience, and product listings.</li>
            <li>Providing personalized recommendations and relevant offers.</li>
            <li>Communicating updates, promotions, and account notifications.</li>
            <li>Ensuring account and payment security.</li>
          </ul>
        </motion.div>

        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">3. Data Protection & Security</h2>
          </div>
          <p className="text-gray-700">
            We employ industry-standard security protocols — including SSL encryption, secure databases, and access control — to protect your data.
            Your account credentials and payment information are encrypted and never stored in plain text.
          </p>
        </motion.div>

        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">4. Sharing & Disclosure</h2>
          </div>
          <p className="text-gray-700">
            NovaXpress does not sell, rent, or trade your personal information.  
            We may share limited data only with trusted service providers (such as payment gateways or logistics partners)
            to fulfill orders and improve platform performance — under strict confidentiality agreements.
          </p>
        </motion.div>

        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">5. Your Rights & Choices</h2>
          </div>
          <p className="text-gray-700 mb-3">
            You have full control over your personal data. You may:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Request access to view the personal data we store about you.</li>
            <li>Update or correct inaccurate details in your account settings.</li>
            <li>Request deletion of your data at any time.</li>
            <li>Opt out of promotional communications.</li>
          </ul>
        </motion.div>

        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">6. Contact Us</h2>
          </div>
          <p className="text-gray-700">
            For questions, data requests, or privacy concerns, please contact our support team at:{' '}
            <a
              href="mailto:privacy@novaxpress.africa"
              className="text-orange-500 font-medium hover:underline"
            >
              privacy@novaxpress.africa
            </a>.
          </p>
        </motion.div>
      </section>

      {/* Footer CTA */}
      <section className="bg-orange-500 text-white text-center py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Your Privacy, Our Priority</h2>
          <p className="text-lg mb-8">
            NovaXpress is built on trust, transparency, and respect for your data.
            We’ll always protect your privacy as you shop and sell online.
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
