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

  // phone prompt state
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [phone, setPhone] = useState('');

  const handleGoogleSignIn = async () => {
    if (!role) {
      toast.error('Please select a role');
      return;
    }

    try {
      const user = await signInWithGoogle(role);

      if (user) {
        if (!user.phoneNumber) {
          // hold user in state and ask for phone
          setPendingUser(user);
          setShowPhonePrompt(true);
          return;
        }

        // if phone number already exists
        finishLogin(user);
      }
    } catch (error) {
      toast.error('Login failed');
      console.error('Login error:', error);
    }
  };

  const finishLogin = async (user: any) => {
    login(user);
    toast.success('Signed in successfully');
    onClose();

    if (role === 'buyer') {
      window.location.href = '/';
    } else {
      window.location.href = '/seller/dashboard';
    }
  };

  const handleSavePhone = async () => {
    if (!phone.trim()) {
      toast.error('Please enter a valid phone number');
      return;
    }

    try {
      // call your backend to update phone number
      await fetch('/api/auth/add-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingUser.email,
          phoneNumber: phone,
          role,
        }),
      });

      pendingUser.phoneNumber = phone; // update locally
      setShowPhonePrompt(false);
      finishLogin(pendingUser);
    } catch (err) {
      console.error('Error saving phone:', err);
      toast.error('Failed to save phone number');
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

      {/* phone number popup */}
      {showPhonePrompt && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-2">
              We didn’t get your phone number 📱
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Please add it now to continue.
            </p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254712345678"
              className="border border-gray-300 rounded w-full px-3 py-2 mb-4"
            />
            <button
              onClick={handleSavePhone}
              className="w-full bg-green-600 text-white py-2 rounded-full hover:bg-green-700"
            >
              Save & Continue
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
