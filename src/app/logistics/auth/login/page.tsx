'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Eye, EyeOff, Package, Truck, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LogisticsAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const strongPassword = (pwd: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pwd);
  };

  const handleSubmit = async () => {
    try {
      if (!email || !password || (!isLogin && (!name || !confirmPassword || !phone))) {
        return toast.error('Please fill in all required fields.');
      }

      if (!isLogin) {
        if (password !== confirmPassword) {
          return toast.error("Passwords don't match.");
        }
        if (!strongPassword(password)) {
          return toast.error(
            'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.'
          );
        }
      }

      if (isLogin) {
        const res = await axios.post('/api/logistics/login', { email, password });
        localStorage.setItem('logisticsToken', res.data.token);
        toast.success('Login successful!');
        router.push('/logistics/dashboard');
      } else {
        const res = await axios.post('/api/logistics/register', {
          name,
          email,
          phone,
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
        backgroundImage:
          "url('/Logistics-partner.jpg')", // same background as affiliate login
      }}
    >
      {/* Overlay gradient for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70 z-0"></div>

      {/* Animated floating icons */}
      <motion.div
        className="absolute top-10 left-10 text-orange-400 opacity-70"
        animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Truck size={50} />
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-12 text-orange-500 opacity-70"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Package size={45} />
      </motion.div>

      <motion.div
        className="absolute top-32 right-1/3 text-white opacity-60"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <MapPin size={40} />
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-1/4 text-orange-300 opacity-50"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <Clock size={40} />
      </motion.div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <img
            src="/Logo.png"
            alt="NovaXmax Logo"
            className="h-16 w-auto mx-auto rounded-lg mb-2"
          />
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? 'Logistics Partner Login' : 'Join NovaXmax Logistics'}
          </h2>
          <p className="text-sm text-gray-300 mt-1">
            Deliver excellence with NovaXmax 🚚
          </p>
        </div>

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
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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

      {/* Subtle footer text */}
      <p className="absolute bottom-4 text-xs text-gray-400 z-10">
        © {new Date().getFullYear()} NovaXmax Logistics — Speed. Reliability. Excellence.
      </p>
    </div>
  );
}
