'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import ReCAPTCHA from 'react-google-recaptcha';
import { Eye, EyeOff } from 'lucide-react';

const AdminAuth = () => {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    securityQuestion: '',
    securityAnswer: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleForm = () => {
    setIsSignup(!isSignup);
  };

  const handleCaptcha = () => setCaptcha(true);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!captcha) return toast.error('Please verify the captcha');

    const route = isSignup ? '/api/admin/signup' : '/api/admin/login';
    const res = await fetch(route, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message);
      if (!isSignup && attempts < 2) {
        setAttempts((prev) => prev + 1);
      } else if (!isSignup && attempts >= 2) {
        toast.error('Too many failed attempts. Locked out.');
      }
      return;
    }

    toast.success(data.message);

    if (!isSignup) {
      router.push('/admin/dashboard');
    } else {
      setIsSignup(false);
      setForm({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        securityQuestion: '',
        securityAnswer: '',
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 shadow rounded bg-white">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        {isSignup ? 'Admin Sign Up' : 'Admin Login'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-2 border rounded"
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            required
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-2 border rounded"
          />
          <span
            className="absolute right-2 top-2 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        {isSignup && (
          <>
            <input
              type="password"
              name="confirmPassword"
              required
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="w-full p-2 border rounded"
            />
            <select
              name="securityQuestion"
              value={form.securityQuestion}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            >
              <option value="">Select a security question</option>
              <option>What is your best pet's name?</option>
              <option>What is your mother's maiden name?</option>
              <option>What is your nickname?</option>
            </select>
            <input
              type="text"
              name="securityAnswer"
              value={form.securityAnswer}
              onChange={handleChange}
              placeholder="Security Answer"
              className="w-full p-2 border rounded"
              required
            />
          </>
        )}

        <ReCAPTCHA sitekey="6Letip0rAAAAANcWf-Y8KpNuO74lZojk2KzKmgks" onChange={handleCaptcha} />

        <button
          type="submit"
          className="w-full bg-orange-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {isSignup ? 'Sign Up' : 'Login'}
        </button>
      </form>
      <p className="text-center mt-4 text-sm">
        {isSignup ? 'Already have an account?' : 'Don’t have an account?'}{' '}
        <button className="text-orange-600 underline" onClick={toggleForm}>
          {isSignup ? 'Login' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
};

export default AdminAuth;
