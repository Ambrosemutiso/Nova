'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Globe2, ShoppingBag, Heart } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { signInWithGoogle } from '@/lib/authUtils';
import { useAuth } from '@/app/context/AuthContext';

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

  // -------------------------------
  // GOOGLE LOGIN FLOW
  // -------------------------------
  const handleGoogleSignIn = async () => {
    try {
      const googleUser = await signInWithGoogle('seller');
      if (!googleUser) return toast.error('Google authentication failed.');

      const res = await axios.post('/api/seller/google-login', {
        provider: 'google',
        name: googleUser.name,
        email: googleUser.email,
        image: googleUser.image,
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

  // -------------------------------
  // EMAIL LOGIN/SIGNUP FLOW
  // -------------------------------
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

  // -------------------------------
  // UI / ANIMATION
  // -------------------------------
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
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? 'Seller Login' : 'Seller Registration'}
          </h2>
          <p className="text-sm text-gray-300 mt-1">
            Empower your business. Start selling globally 🌍
          </p>
        </div>

        {/* Floating icons for animation consistency */}
        <motion.div
          className="absolute -top-10 left-8 text-orange-400 opacity-60"
          animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <ShoppingBag size={40} />
        </motion.div>
        <motion.div
          className="absolute bottom-10 right-8 text-orange-500 opacity-60"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <Heart size={40} />
        </motion.div>
        <motion.div
          className="absolute top-1/4 right-1/4 text-white opacity-40"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <Globe2 size={35} />
        </motion.div>

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
                  className="w-full mb-3 p-2 bg-white/20 border border-white/30 rounded placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full mb-3 p-2 bg-white/20 border border-white/30 rounded placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full mb-3 p-2 bg-white/20 border border-white/30 rounded placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </>
            )}

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-3 p-2 bg-white/20 border border-white/30 rounded placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <div className="relative w-full mb-3">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 bg-white/20 border border-white/30 rounded placeholder-gray-300 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <span
                className="absolute top-2.5 right-3 text-gray-300 cursor-pointer"
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
                className="w-full mb-4 p-2 bg-white/20 border border-white/30 rounded placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            )}

            <button
              onClick={handleSubmit}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition-all"
            >
              {isLogin ? 'Login' : 'Register'}
            </button>

            <button
              onClick={handleGoogleSignIn}
              className="w-full mt-3 bg-white text-orange-600 font-semibold py-2 rounded hover:bg-orange-50 transition-all"
            >
              Continue with Google
            </button>

            <p className="text-sm mt-4 text-center text-gray-300">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-orange-400 hover:underline"
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
