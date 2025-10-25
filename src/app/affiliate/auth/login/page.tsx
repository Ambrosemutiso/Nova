'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

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
        localStorage.setItem('affiliateToken', res.data.token);
        toast.success('Login successful!');
        router.push('/affiliate/dashboard');
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4">
      {/* ✨ Animated gradient orbs background */}
      <motion.div
        className="absolute -top-32 -left-24 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-32 -right-24 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob"
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 9, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"
        animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* 🧊 Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-orange-100 z-10"
      >
        {/* 🎨 Header with Illustration */}
        <div className="flex flex-col items-center mb-6">
          <img src="https://storyset.com/illustration/affiliate-marketing/rafiki.svg"
            alt="Affiliate illustration"
            className="w-28 h-28 object-contain mb-3 drop-shadow-md"
          />
          <h2 className="text-2xl md:text-3xl font-bold text-center text-orange-600 drop-shadow-sm">
            {isLogin ? 'Affiliate Login' : 'Affiliate Registration'}
          </h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          {!isLogin && (
            <>
              <div className="relative">
                <User className="absolute left-3 top-3 text-orange-500" size={18} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300 outline-none"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-orange-500" size={18} />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300 outline-none"
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-orange-500" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300 outline-none"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-orange-500" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300 outline-none"
            />
            <span
              className="absolute top-2.5 right-3 text-gray-600 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {!isLogin && (
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-orange-500" size={18} />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300 outline-none"
              />
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold shadow-lg transition-all"
          >
            {isLogin ? 'Login' : 'Register'}
          </motion.button>
        </form>

        <p className="text-sm mt-6 text-center text-gray-600">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-orange-600 font-semibold hover:underline"
          >
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </p>
      </motion.div>

      {/* Tailwind animation for floating effect */}
      <style jsx global>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, -20px) scale(1.05);
          }
        }
        .animate-blob {
          animation: blob 8s infinite;
        }
      `}</style>
    </div>
  );
}
