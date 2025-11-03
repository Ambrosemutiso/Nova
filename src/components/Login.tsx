'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import { Eye, EyeOff, Globe2, ShoppingBag, Heart } from 'lucide-react';
import { signInWithGoogle } from '@/lib/authUtils';
import { useAuth } from '@/app/context/AuthContext';
import 'react-toastify/dist/ReactToastify.css';

interface LoginModalProps {
  onClose: () => void;
  defaultRole?: 'buyer' | 'seller' | null;
}

export default function LoginModal({ onClose, defaultRole = 'buyer' }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'buyer' | 'seller' | null>(defaultRole);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  useEffect(() => setRole(defaultRole), [defaultRole]);

  const strongPassword = (pwd: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pwd);

  // -------------------------------
  // EMAIL LOGIN/SIGNUP FLOW
  // -------------------------------
  const handleSubmit = async () => {
    if (!role) return toast.error('Please select account type');
    if (!email || !password || (!isLogin && (!name || !country || !confirmPassword || !phoneNumber))) {
      return toast.error('Please fill in all required fields.');
    }

    if (!isLogin) {
      if (password !== confirmPassword) return toast.error("Passwords don't match.");
      if (!strongPassword(password))
        return toast.error('Password must include uppercase, lowercase, number, and symbol.');
    }

    try {
      const res = await axios.post('/api/auth', {
        provider: 'email',
        mode: isLogin ? 'login' : 'signup',
        name,
        email,
        password,
        phoneNumber,
        country,
        role,
      });

      const { token, user } = res.data;
      if (!token) throw new Error('No token returned');

      localStorage.setItem(`${role}Token`, token);
      toast.success(isLogin ? 'Login successful!' : 'Account created successfully!');
      login(user);
      onClose();
      window.location.href = role === 'buyer' ? '/' : '/seller/dashboard';
    } catch (err: any) {
      console.error('Email auth error:', err);
      toast.error(err.response?.data?.error || 'Authentication failed.');
    }
  };

  // -------------------------------
  // GOOGLE LOGIN FLOW
  // -------------------------------
  const handleGoogleSignIn = async () => {
    if (!role) return toast.error('Please select account type');

    try {
      const googleUser = await signInWithGoogle(role);
      if (!googleUser) throw new Error('Google sign-in failed');

      const res = await axios.post('/api/auth/google-login', {
        provider: 'google',
        name: googleUser.name,
        email: googleUser.email,
        image: googleUser.image,
        role,
      });

      const { token, user } = res.data;
      localStorage.setItem(`${role}Token`, token);
      toast.success('Signed in successfully');
      login(user);
      onClose();
      window.location.href = role === 'buyer' ? '/' : '/seller/dashboard';
    } catch (error) {
      console.error('Google auth error:', error);
      toast.error('Google sign-in failed.');
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ToastContainer />
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
          <img src="/Logo.jpg" alt="Novaxpress Logo" className="h-16 w-auto mx-auto rounded-lg mb-2" />
          <h2 className="text-2xl font-bold text-white">
            {isLogin
              ? `${role === 'seller' ? 'Seller Login' : 'Buyer Login'}`
              : `Create ${role === 'seller' ? 'Seller' : 'Buyer'} Account`}
          </h2>
          <p className="text-sm text-gray-300 mt-1">
            {role === 'seller'
              ? 'Start selling globally with ease 🚀'
              : 'Shop smart. Connect globally. 🌍'}
          </p>
        </div>

        {/* Floating icons */}
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
              {isLogin ? "Don't have an account?" : 'Already registered?'}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-orange-400 hover:underline"
              >
                {isLogin ? 'Register here' : 'Login here'}
              </button>
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
