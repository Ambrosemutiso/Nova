'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Eye, EyeOff } from 'lucide-react';

export default function AffiliateAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const strongPassword = (pwd: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pwd);
  };

  const handleSubmit = async () => {
    try {
      if (!email || !password || (!isLogin && (!name || !confirmPassword || !phoneNumber))) {
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
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="bg-white shadow p-6 rounded-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">
          {isLogin ? 'Affiliate Login' : 'Affiliate Registration'}
        </h2>

        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full mb-2 p-2 border rounded"
            />
          </>
        )}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />

        <div className="relative w-full mb-2">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded pr-10"
          />
          <span
            className="absolute top-2.5 right-3 text-gray-600 cursor-pointer"
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
            className="w-full mb-4 p-2 border rounded"
          />
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700"
        >
          {isLogin ? 'Login' : 'Register'}
        </button>

        <p className="text-sm mt-4 text-center">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-green-500 hover:underline"
          >
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
}
