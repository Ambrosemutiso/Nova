'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithGoogle } from '@/lib/authUtils';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '@/app/context/AuthContext';

export default function LoginModal({
  onClose,
  defaultRole = null,
}: {
  onClose: () => void;
  defaultRole?: 'buyer' | 'seller' | null;
}) {
  const [role, setRole] = useState<'buyer' | 'seller' | null>(defaultRole);
  const { login } = useAuth();

  // phone/otp state
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!role) {
      toast.error('Please select a role');
      return;
    }

    try {
      const user = await signInWithGoogle(role);

      if (user) {
        if (user.needsPhoneNumber || !user.isPhoneVerified) {
          setPendingUser(user);
          setShowPhonePrompt(true);
          return;
        }
        finishLogin(user);
      }
    } catch (error) {
      toast.error('Login failed');
      console.error('Login error:', error);
    }
  };

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      toast.error('Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, role }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');

      toast.success('OTP sent to your phone');
      setOtpSent(true);
    } catch (err: any) {
      console.error('Send OTP failed:', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, otp, role }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'OTP verification failed');

      toast.success('Phone verified successfully');

      if (pendingUser) {
        const updatedUser = {
          ...pendingUser,
          phoneNumber: phone,
          isPhoneVerified: true,
          needsPhoneNumber: false,
        };
        setShowPhonePrompt(false);
        finishLogin(updatedUser);
      }
    } catch (err: any) {
      console.error('Verify OTP failed:', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const finishLogin = (user: any) => {
    login(user);
    toast.success('Signed in successfully');
    onClose();

    if (role === 'buyer') {
      window.location.href = '/';
    } else {
      window.location.href = '/seller/dashboard';
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <ToastContainer />
      {/* main login box */}
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 relative">
        <h2 className="text-2xl font-bold mb-4 text-orange-500 text-center">
          Sign In
        </h2>

        {!role ? (
          <div className="space-y-4">
            <button
              onClick={() => setRole('buyer')}
              className="w-full border border-orange-500 text-orange-500 py-2 rounded-full hover:bg-orange-100"
            >
              Continue as Buyer
            </button>
            <button
              onClick={() => setRole('seller')}
              className="w-full border border-green-600 text-green-600 py-2 rounded-full hover:bg-green-100"
            >
              Continue as Seller
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-sm text-gray-600">
              You&apos;re signing in as a{' '}
              <span className="font-semibold">{role}</span>
            </p>

            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-orange-500 text-white py-2 rounded-full hover:bg-orange-600"
            >
              Sign in with Google
            </button>
            <button
              onClick={() => setRole(null)}
              className="w-full text-gray-500 text-sm underline"
            >
              Go back
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>
      </div>

      {/* phone number + OTP modal */}
      {showPhonePrompt && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 space-y-4">
            <h3 className="text-lg font-semibold">Verify your phone </h3>

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254712345678"
              className="border border-gray-300 rounded w-full px-3 py-2"
              disabled={otpSent}
            />

            {!otpSent ? (
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-orange-600 text-white py-2 rounded-full hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            ) : (
              <>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="border border-gray-300 rounded w-full px-3 py-2"
                />
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full bg-orange-600 text-white py-2 rounded-full hover:bg-orange-700 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
