'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithGoogle } from '@/lib/authUtils';
import { toast } from 'react-hot-toast';
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

  const handleGoogleSignIn = async () => {
    if (!role) {
      toast.error('Please select a role');
      return;
    }

    try {
      const user = await signInWithGoogle(role);
      if (user) {
        login(user); // ✅ context login

        toast.success('Signed in successfully');
        onClose();

        if (role === 'buyer') {
          window.location.href = '/';
        } else {
          window.location.href = '/seller/dashboard';
        }
      }
    } catch (error) {
      toast.error('Login failed');
      console.error('Login error:', error);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 relative">
        <h2 className="text-2xl font-bold mb-4 text-orange-500 text-center">Sign In</h2>

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
              You&apos;re signing in as a <span className="font-semibold">{role}</span>
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
    </motion.div>
  );
}
