import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Seller from '@/app/models/seller'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_ecom'; 

// --- Configure Nodemailer (Gmail OAuth2) ---
const transporter = nodemailer.createTransport({
  host: process.env.ZOHO_SMTP_HOST,
  port: Number(process.env.ZOHO_SMTP_PORT),
  secure: false, // 587
  auth: {
    user: process.env.ZOHO_SMTP_USER,
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
      width: 60px;
      margin-bottom: 10px;
    }

    .header h1 {
      color: #ffffff;
      font-size: 11px;
      margin: 0;
      font-weight: 600;
    }

    .body {
      padding: 36px 42px;
    }

    .body h2 {
      font-size: 10px;
      margin-bottom: 12px;
      color: ${primary};
    }

    .body p {
      font-size: 8px;
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
      font-size: 8px;
      text-decoration: none;
    }

    .cta-note {
      font-size: 7px;
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
      font-size: 7px;
    }

    .fallback {
      word-break: break-all;
      font-size: 7px;
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
      font-size: 6px;
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
        <strong>NovaXmax</strong> seller account.
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
      mode, 
      name,
      email,
      password,
      confirmPassword,
      token,
      phoneNumber,
      country,
      currency,
      image,
    } = body;

    if (!mode) {
      return NextResponse.json({ success: false, error: 'Mode is required!' }, { status: 400 });
    }

    // ------------------------------------------------
    // 🔹 SIGNUP
    // ------------------------------------------------
    if (mode === 'signup') {
      if (!name || !email || !password || !phoneNumber || !country) {
        return NextResponse.json({ success: false, error: 'Missing required fields!' }, { status: 400 });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // ✅ Validate phone number (must be 9 digits, no leading 0)
      let clean = phoneNumber.replace(/[\s\-()]/g, '');
      if (clean.startsWith('+')) clean = clean.slice(1);
      clean = clean.replace(/^(254|256|255|250|257|211|251|252)/, '');
      if (clean.startsWith('0')) clean = clean.slice(1);

      if (!/^[1-9]\d{8}$/.test(clean)) {
        return NextResponse.json(
          { success: false, error: 'Invalid phone number. Use 9 digits without starting with 0.' },
          { status: 400 }
        );
      }

      const existing = await Seller.findOne({ email: normalizedEmail });
      if (existing) {
        return NextResponse.json({ success: false, error: 'Email already registered.' }, { status: 400 });
      }

      const hashed = await bcrypt.hash(password, 10);

      const newSeller = await Seller.create({
        name,
        email: normalizedEmail,
        password: hashed,
        phoneNumber,
        country,
        currency,
        image: image || null,
      });

      const token = jwt.sign({ id: newSeller._id.toString(), role: 'seller' }, JWT_SECRET, { expiresIn: '7d' });

      const sellerData = newSeller.toObject();
      delete sellerData.password;

      // Optional: trigger welcome email (non-blocking)
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sendWelcomeEmail`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: newSeller.email, name: newSeller.name, role: 'seller' }),
        });
      } catch (emailErr) {
        console.warn('⚠️ Seller welcome email failed:', emailErr);
      }

      return NextResponse.json({
        success: true,
        message: 'Seller account created successfully!',
        user: sellerData,
        token,
      });
    }

    // ------------------------------------------------
    // 🔹 LOGIN
    // ------------------------------------------------
    if (mode === 'login') {
      if (!email || !password)
        return NextResponse.json({ success: false, error: 'Email and password are required!' }, { status: 400 });

      const seller = await Seller.findOne({ email });
      if (!seller || !seller.password)
        return NextResponse.json({ success: false, error: 'Invalid seller credentials!' }, { status: 401 });

      const isMatch = await bcrypt.compare(password, seller.password);
      if (!isMatch)
        return NextResponse.json({ success: false, error: 'Invalid email or password!' }, { status: 401 });

      const token = jwt.sign({ id: seller._id.toString(), role: 'seller' }, JWT_SECRET, { expiresIn: '7d' });

      const sellerData = seller.toObject();
      delete sellerData.password;

      return NextResponse.json({
        success: true,
        message: 'Seller login successful!',
        user: sellerData,
        token,
      });
    }

    // ------------------------------------------------
    // 🔹 FORGOT PASSWORD
    // ------------------------------------------------
    if (mode === 'forgot-password') {
      if (!email)
        return NextResponse.json({ success: false, error: 'Email is required!' }, { status: 400 });

      const seller = await Seller.findOne({ email });
      if (!seller)
        return NextResponse.json({ success: false, error: 'No seller account found!' }, { status: 404 });

      const resetToken = jwt.sign({ id: seller._id }, JWT_SECRET, { expiresIn: '15m' });
      await sendResetEmail(email, seller.name, seller.role, resetToken);

      return NextResponse.json({
        success: true,
        message: 'Password reset email sent successfully!',
      });
    }

    // ------------------------------------------------
    // 🔹 RESET PASSWORD
    // ------------------------------------------------
    if (mode === 'reset-password') {
      if (!token || !password || !confirmPassword)
        return NextResponse.json({ success: false, error: 'Token, password, and confirmation required!' }, { status: 400 });

      if (password !== confirmPassword)
        return NextResponse.json({ success: false, error: 'Passwords do not match!' }, { status: 400 });

      let decoded: any;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch {
        return NextResponse.json({ success: false, error: 'Invalid or expired token!' }, { status: 401 });
      }

      const seller = await Seller.findById(decoded.id);
      if (!seller)
        return NextResponse.json({ success: false, error: 'Seller not found!' }, { status: 404 });

      seller.password = await bcrypt.hash(password, 10);
      await seller.save();

      return NextResponse.json({ success: true, message: 'Password reset successful!' });
    }

    // ------------------------------------------------
    // ❌ INVALID MODE
    // ------------------------------------------------
    return NextResponse.json({ success: false, error: 'Invalid mode!' }, { status: 400 });
  } catch (err: any) {
    console.error('Seller auth error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Seller authentication failed!' },
      { status: 500 }
    );
  }
}
