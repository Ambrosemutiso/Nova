import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/app/models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_ecom';

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: "465",
  secure: false, 
  auth: {
    user: "noreply@novaxmax.com",
    pass: process.env.ZOHO_SMTP_PASS,
  },
});

// --- Helper: Send Reset Email ---
async function sendResetEmail(email: string, name: string, role: string, token: string) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://novaxmax.com';
  const resetLink = `${BASE_URL}/reset-password?token=${token}`;

  const brand = {
    orange: '#f97316',
    blue: '#2563eb',
    neutral: '#f3f4f6',
    textDark: '#333',
    textLight: '#777',
    darkBg: '#0d1117',
    darkCard: '#161b22',
  };

  const isBuyer = role === 'buyer';
  const primary = isBuyer ? brand.orange : brand.blue;
  const gradientStart = isBuyer ? '#f97316' : '#2563eb';
  const gradientEnd = isBuyer ? '#fb923c' : '#3b82f6';

  const mailOptions = {
    from: `"NovaXmax" <${process.env.ZOHO_SMTP_USER}>`,
    to: email,
    subject: 'Reset Your NovaXmax Password',
    html: `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <title>Reset Your Password</title>

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: ${brand.neutral};
      font-family: 'Segoe UI', Arial, sans-serif;
      color: ${brand.textDark};
    }

    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
    }

    .header {
      background: linear-gradient(135deg, ${gradientStart}, ${gradientEnd});
      padding: 30px 20px;
      text-align: center;
    }

    .header img {
      width: 120px;
      margin-bottom: 10px;
    }

    .header h1 {
      color: #ffffff;
      font-size: 22px;
      margin: 0;
      font-weight: 600;
    }

    .body {
      padding: 36px 42px;
    }

    .body h2 {
      font-size: 20px;
      margin-bottom: 12px;
      color: ${primary};
    }

    .body p {
      font-size: 15px;
      line-height: 1.7;
      margin-bottom: 14px;
    }

    .cta {
      text-align: center;
      margin: 32px 0;
    }

    .cta a {
      display: inline-block;
      background: ${primary};
      color: #ffffff !important;
      padding: 16px 32px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 15px;
      text-decoration: none;
    }

    .cta-note {
      font-size: 13px;
      color: ${brand.textLight};
      margin-top: 10px;
      text-align: center;
    }

    .security-box {
      background: #f9fafb;
      border-left: 4px solid ${primary};
      padding: 16px 18px;
      border-radius: 8px;
      margin: 26px 0;
      font-size: 14px;
    }

    .fallback {
      word-break: break-all;
      font-size: 13px;
      color: ${brand.textLight};
      margin-top: 16px;
    }

    .divider {
      height: 1px;
      background: #e5e7eb;
      margin: 28px 0;
    }

    .footer {
      background: ${brand.neutral};
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: ${brand.textLight};
    }

    .footer a {
      color: ${primary};
      text-decoration: none;
      font-weight: 500;
    }

    @media (prefers-color-scheme: dark) {
      body {
        background: ${brand.darkBg};
        color: #e6edf3;
      }

      .container {
        background: ${brand.darkCard};
        box-shadow: none;
      }

      .security-box {
        background: #0b1220;
      }

      .footer {
        background: ${brand.darkBg};
      }

      .divider {
        background: #30363d;
      }
    }
  </style>
</head>

<body>
  <div class="container">

    <!-- Header -->
    <div class="header">
      <img src="https://novaxmax.com/Logo.png" alt="NovaXmax Logo" />
      <h1>Password Reset Request</h1>
    </div>

    <!-- Body -->
    <div class="body">
      <h2>Hello ${name || 'there'},</h2>

      <p>
        We received a request to reset the password for your
        <strong>NovaXmax</strong> account.
      </p>

      <p>
        To keep your account secure, this request was generated using your
        email address and is valid for a short time only.
      </p>

      <div class="cta">
        <a href="${resetLink}" target="_blank">
          Reset Password
        </a>
      </div>

      <div class="cta-note">
        ⏱ This link expires in <strong>15 minutes</strong>
      </div>

      <div class="security-box">
        🔐 <strong>Security reminder:</strong><br />
        If you did not request this password reset, please ignore this email.
        No changes will be made to your account unless you click the button above.
      </div>

      <p class="fallback">
        Having trouble with the button? Copy and paste this link into your browser:<br />
        <a href="${resetLink}">${resetLink}</a>
      </p>

      <div class="divider"></div>

      <p>
        Need help or suspect suspicious activity?
        Contact our support team at
        <a href="mailto:support@novaxmax.com">support@novaxmax.com</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>
        © ${new Date().getFullYear()} <strong>NovaXmax</strong>. All rights reserved.
      </p>
      <p>
        This email was sent to <strong>${email}</strong> because a password reset
        was requested for your account.
      </p>
    </div>

  </div>
</body>
</html>`,
  };

  await transporter.sendMail(mailOptions);
}


// --- API Route ---
export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const {
      mode, // "login" | "signup" | "forgot-password" | "reset-password"
      name,
      email,
      password,
      confirmPassword,
      token, // for reset-password mode
      role,
      phoneNumber,
      country,
      currency,
      image,
    } = body;

    if (!mode) {
      return NextResponse.json(
        { success: false, error: 'Mode is required!' },
        { status: 400 }
      );
    }

// ------------------------------------------------
// 🔹 SIGNUP (Corrected and hardened)
// ------------------------------------------------
if (mode === 'signup') {
  if (!name || !email || !password || !phoneNumber || !country) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields!' },
      { status: 400 }
    );
  }

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // ✅ Normalize and validate phone number
  let clean = phoneNumber.replace(/[\s\-()]/g, ''); // remove spaces, dashes, brackets
  if (clean.startsWith('+')) clean = clean.slice(1);
  clean = clean.replace(/^(254|256|255|250|257|211|251|252)/, ''); // remove country code
  if (clean.startsWith('0')) clean = clean.slice(1);

  if (!/^[1-9]\d{8}$/.test(clean)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid phone number format. Use 9 digits without leading 0!',
      },
      { status: 400 }
    );
  }

  // ✅ Check if email already exists (normalized)
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return NextResponse.json(
      { success: false, error: 'Email already registered, try logging in!' },
      { status: 400 }
    );
  }

  // ✅ Hash password securely
  const hashed = await bcrypt.hash(password, 10);

  // ✅ Try creating user safely (handle race condition)
  try {
    const newUser = await User.create({
      provider: 'email',
      name,
      email: normalizedEmail,
      password: hashed,
      role: role || 'buyer',
      phoneNumber,
      country,
      currency,
      image: image || null,
    });

    // Generate JWT
    const token = jwt.sign(
      { id: newUser._id.toString(), role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userData = newUser.toObject();
    delete userData.password;

      // ------------------------------------------------
  // 📧 Send Welcome Email (Non-blocking)
  // ------------------------------------------------
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/sendWelcomeEmail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      }),
    });
  } catch (emailErr) {
    console.error('⚠️ Welcome email failed:', emailErr);
  }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      user: userData,
      token,
    });
  } catch (err: any) {
    // ✅ Handle duplicate key error (MongoDB)
    if (err.code === 11000 && err.keyPattern?.email) {
      return NextResponse.json(
        { success: false, error: 'This email is already registered.' },
        { status: 400 }
      );
    }

    console.error('Signup error:', err);
    return NextResponse.json(
      { success: false, error: 'Account creation failed. Please try again.' },
      { status: 500 }
    );
  }
}

    // ------------------------------------------------
    // 🔹 LOGIN
    // ------------------------------------------------
    if (mode === 'login') {
      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: 'Email and password are required!' },
          { status: 400 }
        );
      }

      const user = await User.findOne({ email });
      if (!user || !user.password) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password!' },
          { status: 401 }
        );
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password!' },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        { id: user._id.toString(), role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const userData = user.toObject();
      delete userData.password;

      return NextResponse.json({
        success: true,
        message: 'Login successful!',
        user: userData,
        token,
      });
    }

    // ------------------------------------------------
    // 🔹 FORGOT PASSWORD
    // ------------------------------------------------
    if (mode === 'forgot-password') {
      if (!email) {
        return NextResponse.json(
          { success: false, error: 'Email is required!' },
          { status: 400 }
        );
      }

      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'No account found with that email!' },
          { status: 404 }
        );
      }

      const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '15m' });
      await sendResetEmail(email, user.name, user.role, resetToken);

      return NextResponse.json({
        success: true,
        message: 'Password reset email sent successfully!',
      });
    }

    // ------------------------------------------------
    // 🔹 RESET PASSWORD
    // ------------------------------------------------
    if (mode === 'reset-password') {
      if (!token || !password || !confirmPassword) {
        return NextResponse.json(
          { success: false, error: 'Token, password, and confirmation are required!' },
          { status: 400 }
        );
      }

      if (password !== confirmPassword) {
        return NextResponse.json(
          { success: false, error: 'Passwords do not match!' },
          { status: 400 }
        );
      }

      let decoded: any;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired token!' },
          { status: 401 }
        );
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found!' },
          { status: 404 }
        );
      }

      const hashed = await bcrypt.hash(password, 10);
      user.password = hashed;
      await user.save();

      return NextResponse.json({
        success: true,
        message: 'Password reset successful!',
      });
    }

    // ------------------------------------------------
    // ❌ INVALID MODE
    // ------------------------------------------------
    return NextResponse.json(
      { success: false, error: 'Invalid mode provided!' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication failed!' },
      { status: 500 }
    );
  }
}
