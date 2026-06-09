'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Eye, EyeOff, X, ShieldCheck, Lock, Mail,
  User, Phone, ChevronRight, ArrowLeft,
  Store, ShoppingBag, TrendingUp, Zap, BarChart2
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import 'react-toastify/dist/ReactToastify.css';
import { signInWithGoogle, checkGoogleRedirectResult } from '@/lib/authUtils';

// ── Field-input styles (seller focus ring is blue) ────────────────────────────
const FIELD_INPUT_CSS = `
  .seller-field-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 12px;
    padding: 11px 14px;
    font-size: 14px;
    color: #fff;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .seller-field-input::placeholder { color: rgba(255,255,255,0.22); }
  .seller-field-input:focus {
    border-color: rgba(37,99,235,0.55);
    box-shadow: 0 0 0 3px rgba(37,99,235,0.14);
  }
  select.seller-field-input option { background: #1c1f2a; color: #fff; }
`;

interface LoginModalProps {
  onClose: () => void;
  defaultRole?: 'buyer' | 'seller' | null;
}

const countryData = [
  { name: 'Kenya',       code: 'KE', dialCode: '+254', currency: 'KES' },
  { name: 'Uganda',      code: 'UG', dialCode: '+256', currency: 'UGX' },
  { name: 'Tanzania',    code: 'TZ', dialCode: '+255', currency: 'TZS' },
  { name: 'Rwanda',      code: 'RW', dialCode: '+250', currency: 'RWF' },
  { name: 'Burundi',     code: 'BI', dialCode: '+257', currency: 'BIF' },
  { name: 'South Sudan', code: 'SS', dialCode: '+211', currency: 'SSP' },
  { name: 'Ethiopia',    code: 'ET', dialCode: '+251', currency: 'ETB' },
  { name: 'Somalia',     code: 'SO', dialCode: '+252', currency: 'SOS' },
];

const TruecallerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="#009688"/>
    <path d="M24 10C16.268 10 10 16.268 10 24C10 31.732 16.268 38 24 38C31.732 38 38 31.732 38 24C38 16.268 31.732 10 24 10Z" fill="white"/>
    <path d="M29.5 28.5L26 25L22 29L18.5 19.5L28.5 23L25 27L29.5 28.5Z" fill="#009688"/>
    <circle cx="24" cy="24" r="3" fill="#009688"/>
  </svg>
);

const SELLER_TRUST = [
  { icon: BarChart2,   label: 'Analytics Hub'   },
  { icon: Zap,         label: 'Instant Payouts'  },
  { icon: ShieldCheck, label: 'Fraud Shield'     },
];

export default function SellerLoginDrawer({ onClose, defaultRole = 'seller' }: LoginModalProps) {
  const [isLogin, setIsLogin]                     = useState(true);
  const [isForgot, setIsForgot]                   = useState(false);
  const [role, setRole]                           = useState<'buyer' | 'seller' | null>(defaultRole);
  const [name, setName]                           = useState('');
  const [country, setCountry]                     = useState('');
  const [currency, setCurrency]                   = useState('');
  const [countryCode, setCountryCode]             = useState('');
  const [phoneNumber, setPhoneNumber]             = useState('');
  const [email, setEmail]                         = useState('');
  const [password, setPassword]                   = useState('');
  const [confirmPassword, setConfirmPassword]     = useState('');
  const [showPassword, setShowPassword]           = useState(false);
  const [isMobile, setIsMobile]                   = useState(false);
  const [loading, setLoading]                     = useState(false);

  const { login } = useAuth();

  useEffect(() => setRole(defaultRole), [defaultRole]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handleRedirect = async () => {
      const googleUser = await checkGoogleRedirectResult();
      if (!googleUser) return;
      const res = await axios.post('/api/seller/google-login', { provider: 'google', role: role || 'seller', ...googleUser });
      const { token, user } = res.data;
      localStorage.setItem(`${user.role}Token`, token);
      login(user);
      toast.success('Google login successful!');
      window.location.href = user.role === 'seller' ? '/seller/dashboard' : '/';
    };
    handleRedirect();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) return;
    const run = async () => {
      try {
        const res = await axios.post('/api/seller/google-login', { provider: 'truecaller', token, role: role || 'seller' });
        const { user, token: authToken } = res.data;
        localStorage.setItem(`${user.role}Token`, authToken);
        login(user);
        toast.success('Truecaller login successful!');
        window.location.href = user.role === 'seller' ? '/seller/dashboard' : '/';
      } catch {
        toast.error('Truecaller authentication failed');
      }
    };
    run();
  }, []);

  const strongPassword = (pwd: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pwd);

  const validatePhone = (num: string) => {
    let clean = num.replace(/[\s\-()]/g, '');
    if (clean.startsWith('+254')) clean = clean.slice(4);
    else if (clean.startsWith('254')) clean = clean.slice(3);
    if (clean.startsWith('0')) clean = clean.slice(1);
    return /^[1-9]\d{8}$/.test(clean) ? clean : null;
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const googleUser = await signInWithGoogle(role || 'seller');
      if (!googleUser) return;
      const res = await axios.post('/api/seller/google-login', { provider: 'google', mode: 'google', role: role || 'seller', ...googleUser });
      const { token, user } = res.data;
      localStorage.setItem(`${user.role}Token`, token);
      login(user);
      toast.success('Google login successful!');
      onClose();
      window.location.href = user.role === 'seller' ? '/seller/dashboard' : '/';
    } catch {
      toast.error('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTruecallerLogin = () => {
    try {
      if (typeof window === 'undefined' || !(window as any).Truecaller) {
        toast.error('Truecaller not available');
        return;
      }
      (window as any).Truecaller.init({
        clientId: process.env.NEXT_PUBLIC_TRUECALLER_CLIENT_ID,
        redirectUri: 'https://novaxmax.com/auth/truecaller/callback',
        scope: 'profile phone',
        state: 'login',
        nonce: crypto.randomUUID(),
      });
      (window as any).Truecaller.login();
    } catch {
      toast.error('Truecaller login failed');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return toast.error('Enter your email address first.');
    try {
      setLoading(true);
      const res = await axios.post('/api/seller/google-login', { mode: 'forgot-password', email });
      toast.success(res.data.message || 'Password reset link sent.');
      setIsForgot(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!role) return toast.error('Select account type');
    if (isForgot) return handleForgotPassword();
    if (!email || !password || (!isLogin && (!name || !country || !confirmPassword || !phoneNumber)))
      return toast.error('Fill in all required fields.');
    if (!isLogin) {
      if (password !== confirmPassword) return toast.error("Passwords don't match.");
      if (!strongPassword(password))
        return toast.error('Password needs 8+ chars, uppercase, lowercase, number, and a special character.');
      if (!validatePhone(phoneNumber))
        return toast.error('Enter a valid phone number.');
      try {
        const { data } = await axios.post('/api/seller/google-login', { email });
        if (data.exists) return toast.error('Email already registered. Try logging in.');
      } catch {}
    }
    try {
      setLoading(true);
      const res = await axios.post('/api/seller/google-login', {
        provider: 'email',
        mode: isLogin ? 'login' : 'signup',
        name, email, password,
        phoneNumber: `${countryCode}${phoneNumber}`,
        country, currency, role,
      });
      const { token, user } = res.data;
      localStorage.setItem(`${role}Token`, token);
      login(user);
      toast.success(isLogin ? 'Welcome back!' : 'Seller account created!');
      onClose();
      window.location.href = role === 'buyer' ? '/' : '/seller/dashboard';
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const title = isForgot
    ? 'Reset Password'
    : isLogin
      ? `Sign in as ${role === 'seller' ? 'Seller' : 'Buyer'}`
      : `Create ${role === 'seller' ? 'Seller' : 'Buyer'} Account`;

  return (
    <AnimatePresence>
      {/* Inject seller field-input styles — plain style tag, no jsx pragma */}
      <style dangerouslySetInnerHTML={{ __html: FIELD_INPUT_CSS }} />

      {/* Backdrop */}
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-[9998]"
        style={{ background: 'rgba(5,7,12,0.65)', backdropFilter: 'blur(6px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        key="drawer"
        initial={{ y: isMobile ? '100%' : 0, x: !isMobile ? '100%' : 0 }}
        animate={{ y: 0, x: 0 }}
        exit={{ y: isMobile ? '100%' : 0, x: !isMobile ? '100%' : 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 36 }}
        className="fixed z-[9999] bg-[#0f1117] text-white bottom-0 left-0 right-0 rounded-t-3xl md:top-0 md:right-0 md:left-auto md:bottom-auto md:rounded-none md:w-[420px] md:h-full flex flex-col overflow-hidden"
        style={{ maxHeight: '94vh' }}
      >
        {/* Blue ambient glow for seller */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.15) 0%, transparent 70%)', filter: 'blur(20px)' }}
        />

        {/* Drag handle */}
        <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mt-3 mb-1 md:hidden flex-shrink-0" />

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/[0.07] relative">
          <div className="flex items-center gap-3">
            {isForgot && (
              <button
                onClick={() => setIsForgot(false)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition"
              >
                <ArrowLeft size={14} />
              </button>
            )}
            <div>
              <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest leading-none mb-0.5">NovaXmax</p>
              <p className="text-sm font-bold text-white leading-none">{title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Seller hub intro banner — register only */}
          {!isLogin && !isForgot && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, #0f2744 0%, #1e3a5f 100%)', border: '1px solid rgba(37,99,235,0.25)' }}
            >
              <div
                aria-hidden
                className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.2) 0%, transparent 70%)', filter: 'blur(16px)' }}
              />
              <div className="relative px-4 py-3">
                <p className="text-[10px] font-bold text-blue-400/80 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <TrendingUp size={10} /> Seller Hub
                </p>
                <p className="text-sm font-bold text-white mb-0.5">50,000+ buyers waiting</p>
                <p className="text-xs text-white/40 leading-relaxed">Zero listing fees · M-Pesa payouts · Real-time analytics</p>
              </div>
            </motion.div>
          )}

          {/* Role toggle */}
          {!isForgot && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/[0.04] rounded-2xl border border-white/[0.07]">
              {(['buyer', 'seller'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    role === r
                      ? r === 'seller'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                      : 'text-white/35 hover:text-white/60'
                  }`}
                >
                  {r === 'buyer' ? <ShoppingBag size={14} /> : <Store size={14} />}
                  {r === 'buyer' ? 'Buyer' : 'Seller'}
                </button>
              ))}
            </div>
          )}

          {/* Forgot password */}
          {isForgot && (
            <motion.div key="forgot" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <p className="text-sm text-white/50 leading-relaxed">
                Enter your email and we'll send a reset link within a minute.
              </p>
              <Field icon={<Mail size={14} />} label="Email address" inputClass="seller-field-input">
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@business.com"
                  className="seller-field-input"
                />
              </Field>
            </motion.div>
          )}

          {/* Login / Register */}
          {!isForgot && (
            <motion.div key={isLogin ? 'login' : 'register'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <Field icon={<Mail size={14} />} label="Email address">
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@business.com"
                  className="seller-field-input"
                />
              </Field>

              {!isLogin && (
                <>
                  <Field icon={<User size={14} />} label="Full name">
                    <input
                      type="text" value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Jane Mwangi"
                      className="seller-field-input"
                    />
                  </Field>

                  <div className="flex gap-2">
                    <div className="w-[42%]">
                      <Field icon={<Phone size={14} />} label="Country">
                        <select
                          value={countryCode}
                          onChange={e => {
                            const sel = countryData.find(c => c.dialCode === e.target.value);
                            setCountryCode(e.target.value);
                            if (sel) { setCountry(sel.name); setCurrency(sel.currency); }
                          }}
                          className="seller-field-input"
                        >
                          <option value="">+Code</option>
                          {countryData.map(c => (
                            <option key={c.code} value={c.dialCode}>{c.dialCode} {c.name}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <div className="flex-1">
                      <Field icon={null} label="Phone number">
                        <input
                          type="tel" value={phoneNumber}
                          onChange={e => setPhoneNumber(e.target.value)}
                          placeholder="712 345 678"
                          className="seller-field-input"
                        />
                      </Field>
                    </div>
                  </div>
                </>
              )}

              <Field icon={<Lock size={14} />} label="Password">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="seller-field-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Field>

              {!isLogin && (
                <Field icon={<Lock size={14} />} label="Confirm password">
                  <input
                    type="password" value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="seller-field-input"
                  />
                </Field>
              )}

              {isLogin && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsForgot(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 transition font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Seller trust signals */}
          {!isForgot && (
            <div className="grid grid-cols-3 gap-2">
              {SELLER_TRUST.map(({ icon: Icon, label }, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <Icon size={13} className="text-blue-400/70" />
                  <span className="text-[10px] text-white/35 font-medium text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Social login */}
          {!isForgot && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/[0.08]" />
                <span className="text-[11px] text-white/30 font-medium">or continue with</span>
                <div className="flex-1 h-px bg-white/[0.08]" />
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white py-3 rounded-2xl font-semibold text-sm transition-all duration-200 disabled:opacity-50"
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  Continue with Google
                </button>

                <button
                  onClick={handleTruecallerLogin}
                  disabled={loading}
                  className="md:hidden w-full flex items-center justify-center gap-3 bg-[#009688]/15 hover:bg-[#009688]/25 border border-[#009688]/30 text-white py-3 rounded-2xl font-semibold text-sm transition-all duration-200 disabled:opacity-50"
                >
                  <TruecallerIcon />
                  Continue with Truecaller
                </button>
              </div>
            </>
          )}

          {/* Switch */}
          {!isForgot && (
            <p className="text-center text-xs text-white/35 pb-2">
              {isLogin ? (
                <>
                  No account?{' '}
                  <button onClick={() => setIsLogin(false)} className="text-blue-400 hover:text-blue-300 font-semibold transition">
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button onClick={() => setIsLogin(true)} className="text-blue-400 hover:text-blue-300 font-semibold transition">
                    Sign in
                  </button>
                </>
              )}
            </p>
          )}
        </div>

        {/* Sticky CTA */}
        <div className="flex-shrink-0 px-6 pb-6 pt-3 border-t border-white/[0.07] bg-[#0f1117] space-y-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={
              role === 'seller'
                ? { background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 6px 24px rgba(37,99,235,0.35)' }
                : { background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 6px 24px rgba(249,115,22,0.3)' }
            }
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
              />
            ) : (
              <>
                {isForgot ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'}
                <ChevronRight size={16} />
              </>
            )}
          </motion.button>

          <div className="flex items-center justify-center gap-1.5">
            <Lock size={9} className="text-white/20" />
            <span className="text-[10px] text-white/20">Secured by NovaXmax · TLS 1.3 encryption</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ icon, label, inputClass, children }: { icon: React.ReactNode; label: string; inputClass?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[10px] font-bold text-white/35 uppercase tracking-[0.12em] pl-0.5">
        {icon && <span className="text-white/25">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}