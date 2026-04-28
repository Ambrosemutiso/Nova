'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import 'react-toastify/dist/ReactToastify.css';
import { signInWithGoogle, checkGoogleRedirectResult } from '@/lib/authUtils';

interface LoginModalProps {
  onClose: () => void;
  defaultRole?: 'buyer' | 'seller' | null;
}

export default function SellerLoginDrawer({ onClose, defaultRole = 'seller' }: LoginModalProps) {
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

  // ✅ GOOGLE REDIRECT (UNCHANGED)
  useEffect(() => {
    const handleRedirect = async () => {
      const googleUser = await checkGoogleRedirectResult();
      if (!googleUser) return;

      const res = await axios.post('/api/seller/google-login', {
        provider: 'google',
        role: role || 'buyer',
        ...googleUser,
      });

      const { token, user } = res.data;

      localStorage.setItem(`${user.role}Token`, token);
      login(user);

      toast.success('Google login successful!');

      window.location.href =
        user.role === 'seller' ? '/seller/dashboard' : '/';
    };

    handleRedirect();
  }, []);

useEffect(() => {
  const handleTruecallerResponse = async () => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) return;

    try {
      const res = await axios.post("/api/seller/google-login", {
        provider: 'truecaller',
        token,
        role: role || "buyer",
      });

      const { user, token: authToken } = res.data;

      localStorage.setItem(`${user.role}Token`, authToken);

      login(user);

      toast.success("Truecaller login successful!");

      window.location.href =
        user.role === "seller"
          ? "/seller/dashboard"
          : "/";
    } catch (err: any) {
      console.error(err);
      toast.error("Truecaller authentication failed");
    }
  };

  handleTruecallerResponse();
}, []);
  // ✅ GOOGLE LOGIN (UNCHANGED)
  const handleGoogleLogin = async () => {
    try {
      const googleUser = await signInWithGoogle(role || 'buyer');
      if (!googleUser) return;

      const res = await axios.post('/api/seller/google-login', {
        provider: 'google',
        mode: 'google',
        role: role || 'buyer',
        ...googleUser,
      });

      const { token, user } = res.data;

      localStorage.setItem(`${user.role}Token`, token);
      login(user);

      toast.success('Google login successful!');
      onClose();

      window.location.href =
        user.role === 'seller' ? '/seller/dashboard' : '/';

    } catch (err: any) {
      console.error(err);
      toast.error('Google login failed');
    }
  };
const handleTruecallerLogin = () => {
  try {
    if (typeof window === "undefined" || !(window as any).Truecaller) {
      toast.error("Truecaller SDK not loaded");
      return;
    }

(window as any).Truecaller.init({
  clientId: process.env.NEXT_PUBLIC_TRUECALLER_CLIENT_ID,
  redirectUri: "https://novaxmax.com/auth/truecaller/callback",
  scope: "profile phone",
  state: "login",
  nonce: crypto.randomUUID(),
});

    (window as any).Truecaller.login();
  } catch (err) {
    console.error(err);
    toast.error("Truecaller login failed");
  }
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

  // ✅ MAIN SUBMIT (UNCHANGED)
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

      localStorage.setItem(`${role}Token`, token);
      login(user);

      toast.success(isLogin ? 'Login successful!' : 'Account created successfully!');
      onClose();

      window.location.href = role === 'buyer' ? '/' : '/seller/dashboard';
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Authentication failed.');
    }
  };

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Drawer */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed bottom-0 left-0 right-0 bg-white z-[999999999] rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-xl"
      >
        {/* Handle */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-2" />

        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3 border-b">
          <h2 className="font-semibold text-lg text-gray-800">
            {isForgot
              ? 'Reset Password'
              : isLogin
              ? `${role === 'seller' ? 'Seller Login' : 'Buyer Login'}`
              : `Create ${role === 'seller' ? 'Seller' : 'Buyer'} Account`}
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />

          {!isLogin && !isForgot && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
              />

<div className="flex gap-2 w-full">
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
    className="input w-1/4 min-w-[90px]"
  >
    <option value="">+Code</option>
    {countryData.map((c) => (
      <option key={c.code} value={c.dialCode}>
        {c.flag} {c.dialCode} {c.name}
      </option>
    ))}
  </select>

  <input
    type="text"
    placeholder="Phone Number"
    value={phoneNumber}
    onChange={(e) => setPhoneNumber(e.target.value)}
    className="input w-3/4"
  />
</div>
            </>
          )}

          {!isForgot && (
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pr-10"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 cursor-pointer"
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
              className="input"
            />
          )}

          {isLogin && !isForgot && (
            <div className="text-right">
              <button onClick={() => setIsForgot(true)} className="text-sm text-orange-600">
                Forgot password?
              </button>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleSubmit}
            className="w-full bg-orange-600 text-white py-3 rounded-xl font-semibold"
          >
            {isForgot ? 'Send Reset Link' : isLogin ? 'Login' : 'Register'}
          </button>

{/* Divider */}
<div className="flex items-center my-4">
  <div className="flex-1 border-t border-gray-300"></div>
  <span className="px-3 text-sm text-gray-500">OR</span>
  <div className="flex-1 border-t border-gray-300"></div>
</div>

{/* Google */}
<button
  onClick={handleGoogleLogin}
  className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-800 py-3 rounded-xl hover:bg-gray-50 transition font-semibold"
>
  <img
    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
    className="w-5 h-5"
  />
  Continue with Google
</button>

{/* Truecaller */}
<button
  onClick={handleTruecallerLogin}
  className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-semibold mt-3"
>
<img
  src="https://cdn.worldvectorlogo.com/logos/truecaller.svg"
  alt="Truecaller"
  className="w-5 h-5"
/>
  Continue with Truecaller
</button>
          {/* Switch */}
          <p className="text-center text-sm">
            {isForgot ? (
              <button onClick={() => setIsForgot(false)} className="text-orange-600">
                Back to Login
              </button>
            ) : isLogin ? (
              <>
                Don't have an account?{' '}
                <button onClick={() => setIsLogin(false)} className="text-orange-600">
                  Register
                </button>
              </>
            ) : (
              <>
                Already registered?{' '}
                <button onClick={() => setIsLogin(true)} className="text-orange-600">
                  Login
                </button>
              </>
            )}
          </p>
        </div>
      </motion.div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          outline: none;
        }
        .input:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
        }
      `}</style>
    </AnimatePresence>
  );
}