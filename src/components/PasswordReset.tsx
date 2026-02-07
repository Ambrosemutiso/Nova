'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing token.');
      router.push('/');
    }
  }, [token, router]);

  const strongPassword = (pwd: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pwd);

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      return toast.error('Please fill in all fields.');
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords don't match.");
    }

    if (!strongPassword(password)) {
      return toast.error(
        'Password must include uppercase, lowercase, number, and symbol.'
      );
    }

    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/google-login', {
        mode: 'reset-password',
        token,
        password,
        confirmPassword,
      });

      if (res.data.success) {
        toast.success('Password reset successful! Please log in.');
        router.push('/');
      } else {
        toast.error(res.data.error || 'Failed to reset password.');
      }
    } catch (err: any) {
      console.error('Reset error:', err);
      toast.error(err.response?.data?.error || 'Reset failed.');
    } finally {
      setIsLoading(false);
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
        <div className="text-center mb-6">
          <img
            src="/Logo.png"
            alt="Novaxmax Logo"
            className="h-16 w-auto mx-auto rounded-lg mb-2"
          />
          <h2 className="text-2xl font-bold text-white">
            Reset Your Password
          </h2>
          <p className="text-gray-300 text-sm mt-1">
            Enter and confirm your new password below.
          </p>
        </div>

        <div className="relative w-full mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 bg-white/20 border border-white/30 rounded placeholder-gray-300 pr-10 focus:ring-2 focus:ring-orange-500"
          />
          <span
            className="absolute top-2.5 right-3 text-gray-300 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full mb-4 p-2 bg-white/20 border border-white/30 rounded placeholder-gray-300 focus:ring-2 focus:ring-orange-500"
        />

        <button
          onClick={handleReset}
          disabled={isLoading}
          className={`w-full ${
            isLoading ? 'bg-orange-400' : 'bg-orange-600 hover:bg-orange-700'
          } text-white py-2 rounded font-semibold transition-all`}
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>

        <p className="text-sm mt-4 text-center text-gray-300">
          Remembered your password?{' '}
          <button
            onClick={() => router.push('/')}
            className="text-orange-400 hover:underline"
          >
            Go to Login
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
}
