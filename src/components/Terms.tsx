'use client';

import { ShieldCheck, Gavel, FileText, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-10">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 text-white py-24 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Terms & Conditions</h1>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto">
            Please read these terms carefully before using NovaXmax.  
            By accessing or creating an account, you agree to these terms of service.
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
            <FileText className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">1. Introduction</h2>
          </div>
          <p className="text-gray-700">
            These Terms & Conditions govern your use of NovaXmax — an online multi-vendor marketplace
            connecting buyers and sellers across East Africa. By using our services, you confirm that you
            understand, accept, and agree to comply with these terms and all applicable laws.
          </p>
        </motion.div>

        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">2. User Responsibilities</h2>
          </div>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>You must provide accurate and up-to-date information when creating an account or listing products.</li>
            <li>Users must not engage in fraudulent, misleading, or illegal activities on the platform.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>Sellers must ensure that all products are authentic, lawful, and described truthfully.</li>
          </ul>
        </motion.div>

        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Gavel className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">3. Prohibited Conduct</h2>
          </div>
          <p className="text-gray-700 mb-3">
            Users are strictly prohibited from engaging in any conduct that disrupts the NovaXmax ecosystem or harms other users.
            Examples include:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Posting or selling counterfeit, stolen, or illegal goods.</li>
            <li>Using NovaXmax for spam, phishing, or any unauthorized commercial solicitation.</li>
            <li>Manipulating pricing, ratings, or feedback mechanisms in bad faith.</li>
          </ul>
        </motion.div>

        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-semibold text-gray-900">4. Account Suspension</h2>
          </div>
          <p className="text-gray-700">
            NovaXmax reserves the right to suspend or terminate any account that violates these terms,
            engages in suspicious activity, or causes harm to the platform or its users.  
            Suspensions may be temporary or permanent depending on the severity of the violation.
          </p>
        </motion.div>

        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Changes to the Terms</h2>
          <p className="text-gray-700">
            NovaXmax may update these Terms & Conditions periodically to reflect changes in policies,
            features, or regulatory requirements. Users will be notified of major updates, and continued
            use of the platform constitutes acceptance of the revised terms.
          </p>
        </motion.div>

        <motion.div
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions or concerns about these Terms & Conditions, please contact us at:{' '}
            <a
              href="mailto:support@novaxmax.com"
              className="text-orange-500 font-medium hover:underline"
            >
              support@novaxmax.com
            </a>.
          </p>
        </motion.div>
      </section>

      {/* Footer CTA */}
      <section className="bg-orange-500 text-white text-center py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Your Trust, Our Commitment</h2>
          <p className="text-lg mb-8">
            At NovaXmax, we take your privacy, security, and satisfaction seriously.
            We’re committed to maintaining transparency in every transaction.
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
