'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { signInWithGoogle } from '@/lib/authUtils';
import { useAuth } from '@/app/context/AuthContext';
import axios from 'axios';

export default function SellerLoginModal({ onClose }: { onClose: () => void }) {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const strongPassword = (pwd: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pwd);

  // -----------------------------
  // 🔹 GOOGLE LOGIN HANDLER
  // -----------------------------
const handleGoogleSignIn = async () => {
  try {
    const user = await signInWithGoogle('seller');
    if (!user) return toast.error('Google authentication failed.');

    // ✅ Support both Firebase fields and normalized format
    const name = user.name;
    const email = user.email;
    const image = user.image;

    const res = await axios.post('/api/seller/google-login', {
      provider: 'google',
      name,
      email,
      image,
      role: 'seller',
      plan: 'free',
    });

    if (res.data.success) {
      localStorage.setItem('sellerToken', res.data.token);
      login(res.data.user);
      toast.success('Signed in successfully!');
      onClose();
      window.location.href = '/seller/dashboard';
    } else {
      toast.error(res.data.message || 'Login failed.');
    }
  } catch (error) {
    console.error('Google login error:', error);
    toast.error('Google login failed.');
  }
};

  // -----------------------------
  // 🔹 EMAIL/PASSWORD HANDLER
  // -----------------------------
  const handleSubmit = async () => {
    try {
      if (!email || !password || (!isLogin && (!fullName || !country || !phoneNumber || !confirmPassword))) {
        return toast.error('Please fill in all required fields.');
      }

      if (!isLogin) {
        if (password !== confirmPassword) return toast.error("Passwords don't match.");
        if (!strongPassword(password))
          return toast.error('Password must include uppercase, lowercase, number, and symbol.');
      }

      const payload = {
        provider: 'email',
        mode: isLogin ? 'login' : 'register',
        email,
        password,
        name: fullName,
        country,
        phoneNumber,
        plan: 'free',
      };

      const res = await axios.post('/api/seller/auth', payload);

      if (res.data.success) {
        if (isLogin) {
          localStorage.setItem('sellerToken', res.data.token);
          login(res.data.user);
          toast.success('Login successful!');
          onClose();
          window.location.href = '/seller/dashboard';
        } else {
          toast.success('Registered successfully! You can now log in.');
          setIsLogin(true);
        }
      } else {
        toast.error(res.data.message || 'Something went wrong.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Server error.');
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <ToastContainer />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-6 rounded-2xl shadow-2xl w-96 relative overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 text-green-600 text-center">
          {isLogin ? 'Seller Login' : 'Seller Registration'}
        </h2>

        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            {!isLogin && (
              <>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full mb-3 p-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full mb-3 p-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full mb-3 p-2 border border-gray-300 rounded-md"
                />
              </>
            )}

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-3 p-2 border border-gray-300 rounded-md"
            />

            <div className="relative w-full mb-3">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md pr-10"
              />
              <span
                className="absolute top-2.5 right-3 text-gray-400 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            {!isLogin && (
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mb-4 p-2 border border-gray-300 rounded-md"
              />
            )}

            <button
              onClick={handleSubmit}
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition font-semibold"
            >
              {isLogin ? 'Login' : 'Register'}
            </button>

            <p className="text-sm mt-4 text-center text-gray-600">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-green-600 hover:underline"
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>

            <div className="my-4 text-center text-gray-400 text-sm">or</div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
            >
              Continue with Google
            </button>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
