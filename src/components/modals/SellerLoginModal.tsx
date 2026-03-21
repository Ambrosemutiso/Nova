
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import 'react-toastify/dist/ReactToastify.css';

interface LoginModalProps {
  onClose: () => void;
  defaultRole?: 'buyer' | 'seller' | null;
}

export default function SellerLoginModal({ onClose, defaultRole = 'seller' }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [role, setRole] = useState<'buyer' | 'seller' | null>(defaultRole);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  useEffect(() => setRole(defaultRole), [defaultRole]);

  const countryData = [
    { name: 'Kenya', code: 'KE', flag: 'https://flagcdn.com/w40/ke.png', dialCode: '+254', currency: 'KES' },
    { name: 'Uganda', code: 'UG', flag: 'https://flagcdn.com/w40/ug.png', dialCode: '+256', currency: 'UGX' },
    { name: 'Tanzania', code: 'TZ', flag: 'https://flagcdn.com/w40/tz.png', dialCode: '+255', currency: 'TZS' },
    { name: 'Rwanda', code: 'RW', flag: 'https://flagcdn.com/w40/rw.png', dialCode: '+250', currency: 'RWF' },
    { name: 'Burundi', code: 'BI', flag: 'https://flagcdn.com/w40/bi.png', dialCode: '+257', currency: 'BIF' },
    { name: 'South Sudan', code: 'SS', flag: 'https://flagcdn.com/w40/ss.png', dialCode: '+211', currency: 'SSP' },
    { name: 'Ethiopia', code: 'ET', flag: 'https://flagcdn.com/w40/et.png', dialCode: '+251', currency: 'ETB' },
    { name: 'Somalia', code: 'SO', flag: 'https://flagcdn.com/w40/so.png', dialCode: '+252', currency: 'SOS' },
  ];

  const strongPassword = (pwd: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pwd);

  const validatePhone = (num: string): string | null => {
    if (!num) return null;
    let clean = num.replace(/[\s\-()]/g, '');
    if (clean.startsWith('+254')) clean = clean.slice(4);
    else if (clean.startsWith('254')) clean = clean.slice(3);
    if (clean.startsWith('0')) clean = clean.slice(1);
    if (/^[1-9]\d{8}$/.test(clean)) return clean;
    return null;
  };

  const handleEmailCheck = async (email: string) => {
    try {
      const res = await axios.post('/api/seller/google-login', { email });
      return res.data.exists;
    } catch {
      return false;
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return toast.error('Please enter your email address.');

    try {
      const res = await axios.post('/api/seller/google-login', {
        mode: 'forgot-password',
        email,
      });

      toast.success(res.data.message || 'Password reset link sent to your email.');
      setIsForgot(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send reset link.');
    }
  };

  const handleSubmit = async () => {
    if (!role) return toast.error('Please select account type');
    if (isForgot) return handleForgotPassword();

    if (!email || !password || (!isLogin && (!name || !country || !confirmPassword || !phoneNumber))) {
      return toast.error('Please fill in all required fields.');
    }

    if (!isLogin) {
      if (password !== confirmPassword) return toast.error("Passwords don't match.");
      if (!strongPassword(password))
        return toast.error('Password must be 8 characters, include uppercase, lowercase, number, and a special character.');
      if (!validatePhone(phoneNumber))
        return toast.error('Enter a valid phone number without starting with 0, 07, 06, or 05.');

      const emailUsed = await handleEmailCheck(email);
      if (emailUsed) return toast.error('Email already registered. Try logging in.');
    }

    try {
      const res = await axios.post('/api/seller/google-login', {
        provider: 'email',
        mode: isLogin ? 'login' : 'signup',
        name,
        email,
        password,
        phoneNumber: `${countryCode}${phoneNumber}`,
        country,
        currency,
        role,
      });

      const { token, user } = res.data;
      if (!token) throw new Error('No token returned');

      localStorage.setItem(`${role}Token`, token);
      toast.success(isLogin ? 'Login successful!' : 'Account created successfully!');
      login(user);
      onClose();
      window.location.href = '/seller/dashboard';
    } catch (err: any) {
      console.error('Auth error:', err);
      toast.error(err.response?.data?.error || 'Authentication failed.');
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
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-300 hover:text-orange-400">✕</button>

        <div className="text-center mb-6">
          <img src="/Logo.png" alt="NovaXmax Logo" className="h-16 w-auto mx-auto rounded-lg mb-2" />
          <h2 className="text-2xl font-bold text-white">
            {isForgot
              ? 'Reset Password'
              : isLogin
              ? 'Seller Login'
              : 'Create Seller Account'}
          </h2>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isForgot ? 'forgot' : isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            {/* EMAIL FIELD */}
            <input
              type="email"
              placeholder="Your Brand/Shop Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-3 p-2 bg-white/20 border border-white/30 rounded placeholder-gray-300 focus:ring-2 focus:ring-blue-500"
            />

            {!isLogin && !isForgot && (
              <>
                <input
                  type="text"
                  placeholder="Your Brand/Shop Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mb-3 p-2 bg-white/20 border border-white/30 rounded placeholder-gray-300 focus:ring-2 focus:ring-blue-500"
                />

                {/* PHONE INPUT */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-2 bg-white/20 border border-white/30 rounded px-2 py-1">
                    <img
                      src={countryData.find((c) => c.dialCode === countryCode)?.flag}
                      alt="flag"
                      className="w-6 h-4 rounded-sm object-cover"
                    />
<select
  value={countryCode}
  onChange={(e) => {
    const selected = countryData.find((c) => c.dialCode === e.target.value);
    setCountryCode(e.target.value);

    if (selected) {
      setCountry(selected.name);
      setCurrency(selected.currency);
    }
  }}
  className="bg-transparent text-white cursor-pointer focus:outline-none"
>
  <option value="" disabled className="text-black">
    Select Country
  </option>

  {countryData.map((c) => (
    <option key={c.code} value={c.dialCode} className="text-black">
      {c.name} ({c.dialCode})
    </option>
  ))}
</select>
                  </div>

                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-[55%] p-2 bg-white/20 border border-white/30 rounded placeholder-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {!isForgot && (
              <div className="relative w-full mb-3">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 bg-white/20 border border-white/30 rounded placeholder-gray-300 pr-10 focus:ring-2 focus:ring-blue-500"
                />
                <span
                  className="absolute top-2.5 right-3 text-gray-300 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            )}

            {!isLogin && !isForgot && (
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mb-4 p-2 bg-white/20 border border-white/30 rounded placeholder-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            )}

            {isLogin && !isForgot && (
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setIsForgot(true)}
                  className="text-sm text-orange-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition-all"
            >
              {isForgot ? 'Send Reset Link' : isLogin ? 'Login' : 'Register'}
            </button>

            <p className="text-sm mt-4 text-center text-gray-300">
              {isForgot ? (
                <button onClick={() => setIsForgot(false)} className="text-orange-400 hover:underline">
                  Back to Login
                </button>
              ) : isLogin ? (
                <>
                  Don't have an account?{' '}
                  <button onClick={() => setIsLogin(false)} className="text-orange-400 hover:underline">
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button onClick={() => setIsLogin(true)} className="text-orange-400 hover:underline">
                    Login
                  </button>
                </>
              )}
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
