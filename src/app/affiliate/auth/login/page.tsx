'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Eye, EyeOff, Briefcase, BarChart3, Globe2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AffiliateAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const strongPassword = (pwd: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pwd);

  const handleSubmit = async () => {
    try {
      if (!email || !password || (!isLogin && (!name || !confirmPassword || !phoneNumber))) {
        return toast.error('Please fill in all required fields.');
      }

      if (!isLogin) {
        if (password !== confirmPassword) return toast.error("Passwords don't match.");
        if (!strongPassword(password))
          return toast.error(
            'Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol.'
          );
      }

      if (isLogin) {
        const res = await axios.post('/api/affiliate/auth/login', { email, password });
        toast.success('Login successful!');
        window.location.href = '/affiliate/dashboard';

      } else {
        const res = await axios.post('/api/affiliate/auth/register', {
          name,
          email,
          phoneNumber,
          password,
        });
        toast.success(res.data.message || 'Registered successfully! You can now log in.');
        setIsLogin(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Something went wrong.');
    }
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden px-4 bg-cover bg-center"
      style={{
        backgroundImage: "url('/Affiliate-dashboard.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70 z-0"></div>

      {/* Floating Icons */}
      <motion.div
        className="absolute top-10 left-10 text-orange-400 opacity-70"
        animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Briefcase size={45} />
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-12 text-orange-500 opacity-70"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <BarChart3 size={45} />
      </motion.div>
      <motion.div
        className="absolute top-1/3 right-1/4 text-white opacity-60"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Globe2 size={40} />
      </motion.div>
      <motion.div
        className="absolute bottom-10 left-1/4 text-orange-300 opacity-50"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <MessageSquare size={40} />
      </motion.div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <img src="/Logo.png" alt="NovaXmax Logo" className="h-16 w-auto mx-auto rounded-lg mb-2" />
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? 'Affiliate Login' : 'Join NovaXmax Affiliates'}
          </h2>
          <p className="text-sm text-gray-300 mt-1">
            Empower your earnings with NovaXmax 💼
          </p>
        </div>

        {/* 🔥 Animated Form Section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            {!isLogin && (
              <>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mb-3 p-2 bg-white/20 border border-white/30 text-white rounded placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full mb-3 p-2 bg-white/20 border border-white/30 text-white rounded placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </>
            )}

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-3 p-2 bg-white/20 border border-white/30 text-white rounded placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <div className="relative w-full mb-3">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 bg-white/20 border border-white/30 text-white rounded placeholder-gray-300 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                className="w-full mb-4 p-2 bg-white/20 border border-white/30 text-white rounded placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            )}

            <button
              onClick={handleSubmit}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition-all"
            >
              {isLogin ? 'Login' : 'Register'}
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

      {/* Footer */}
      <p className="absolute bottom-4 text-xs text-gray-400 z-10">
        © {new Date().getFullYear()} NovaXmax Affiliates — Connect. Earn. Grow.
      </p>
    </div>
  );
}
