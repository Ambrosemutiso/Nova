import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Seller from '@/app/models/seller'; // ✅ Use Seller model instead of User
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'novaxpress_secret_123'; // Replace in production

// --- Configure Nodemailer (Gmail OAuth2) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

// --- Helper: Send Reset Email ---
async function sendResetEmail(email: string, name: string, token: string) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://novaxpress.co.ke';
  const resetLink = `${BASE_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"NovaXpress Sellers" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Reset Your NovaXpress Seller Password',
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
      <div style="background:linear-gradient(135deg,#2563eb,#3b82f6); color:white; padding:20px; text-align:center;">
        <img src="https://novaxpress.co.ke/Logo.jpg" alt="NovaXpress Logo" width="100" style="border-radius:8px;"/>
        <h2>Password Reset Request</h2>
      </div>
      <div style="padding:30px;">
        <p>Hello <strong>${name || 'Seller'}</strong>,</p>
        <p>We received a request to reset your NovaXpress Seller password.</p>
        <p>Click below to create a new password:</p>
        <p style="text-align:center;">
          <a href="${resetLink}" style="background:#2563eb; color:#fff; padding:12px 20px; border-radius:6px; text-decoration:none; font-weight:bold;">Reset Password 🔒</a>
        </p>
        <p style="font-size:14px; color:#666;">This link expires in 15 minutes for security.</p>
        <p>If you didn’t request this, please ignore this email.</p>
      </div>
      <div style="background:#f3f4f6; padding:20px; text-align:center; font-size:13px; color:#555;">
        <p>Need help? Contact <a href="mailto:support@novaxpress.shop" style="color:#2563eb;">support@novaxpress.shop</a></p>
        <p>© ${new Date().getFullYear()} NovaXpress Sellers. All rights reserved.</p>
      </div>
    </div>
    `,
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
      token, // for reset-password
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
      await sendResetEmail(email, seller.name, resetToken);

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
