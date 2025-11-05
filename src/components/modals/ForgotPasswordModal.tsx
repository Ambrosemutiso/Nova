'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

export default function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) return toast.error('Please enter your email address.');

    setIsSubmitting(true);
    try {
      const res = await axios.post('/api/auth/google-login', {
        mode: 'forgot-password',
        email,
      });

      if (res.data.success) {
        setIsSent(true);
        toast.success('Password reset email sent successfully!');
      } else {
        toast.error(res.data.error || 'Unable to send reset email.');
      }
    } catch (err: any) {
      console.error('Forgot password error:', err);
      toast.error(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl w-[90%] max-w-md text-white"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-300 hover:text-orange-400"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <img
            src="/Logo.jpg"
            alt="Novaxpress Logo"
            className="h-16 w-auto mx-auto rounded-lg mb-2"
          />
          <h2 className="text-2xl font-bold text-white">Forgot Password</h2>
          <p className="text-gray-300 text-sm mt-1">
            Enter your email to receive a password reset link.
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isSent ? 'sent' : 'form'}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            {!isSent ? (
              <>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mb-4 p-2 bg-white/20 border border-white/30 rounded placeholder-gray-300 focus:ring-2 focus:ring-orange-500"
                />

                <button
                  onClick={handleForgotPassword}
                  disabled={isSubmitting}
                  className={`w-full ${
                    isSubmitting
                      ? 'bg-orange-400 cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-700'
                  } text-white py-2 rounded font-semibold transition-all`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </>
            ) : (
              <div className="text-center">
                <p className="text-gray-200 mb-4">
                  A reset link has been sent to your email. Please check your inbox and follow the
                  instructions.
                </p>
                <button
                  onClick={onClose}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
