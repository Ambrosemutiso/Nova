'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'react-toastify';

export default function TruecallerCallbackPage() {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const handleTruecallerLogin = async () => {
      try {
        // 🔥 Get token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
          toast.error('Truecaller login failed (no token)');
          return router.push('/');
        }

        // 🔥 Send to backend for verification
        const res = await axios.post('/api/auth/google-login', {
          provider: 'truecaller',
          token,
        });

        const { user, token: jwtToken } = res.data;

        // Save token
        localStorage.setItem(`${user.role}Token`, jwtToken);

        // Login context
        login(user);

        toast.success('Truecaller login successful!');

        // Redirect
        router.push(user.role === 'seller' ? '/seller/dashboard' : '/');

      } catch (err: any) {
        console.error(err);
        toast.error('Truecaller login failed');
        router.push('/');
      }
    };

    handleTruecallerLogin();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-600">Signing you in with Truecaller...</p>
    </div>
  );
}