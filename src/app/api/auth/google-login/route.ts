import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/app/models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'novaxpress_secret_123'; // Replace in production

// --- Configure Nodemailer (Gmail) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
        type: "OAuth2",
        user: process.env.GMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

// --- Helper: Send Reset Email ---
async function sendResetEmail(email: string, name: string, role: string, token: string) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://novaxpress.co.ke';
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
    from: `"NovaXpress" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Reset Your NovaXpress Password',
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="color-scheme" content="light dark" />
      <title>Password Reset</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: ${brand.neutral};
          color: ${brand.textDark};
          font-family: 'Segoe UI', Arial, sans-serif;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .header {
          background: linear-gradient(135deg, ${gradientStart}, ${gradientEnd}, ${
      isBuyer ? '#facc15' : '#06b6d4'
    });
          background-size: 300% 300%;
          animation: gradientShift 6s ease infinite;
          padding: 25px 0;
          text-align: center;
        }
        .header img {
          margin-bottom: 8px;
        }
        .header h1 {
          color: #fff;
          font-size: 22px;
          margin: 0;
          letter-spacing: 0.5px;
        }
        .body {
          padding: 30px 40px;
        }
        .body h2 {
          color: ${primary};
          margin-bottom: 10px;
        }
        .body p {
          font-size: 15px;
          line-height: 1.6;
        }
        .cta {
          text-align: center;
          margin: 30px 0;
        }
        .cta a {
          background: ${primary};
          color: #fff !important;
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: bold;
          display: inline-block;
          transition: all 0.3s ease;
        }
        .cta a:hover {
          opacity: 0.9;
        }
        .footer {
          background: ${brand.neutral};
          padding: 25px;
          text-align: center;
          font-size: 13px;
          color: ${brand.textLight};
        }
        .divider {
          height: 1px;
          background-color: #e5e7eb;
          margin: 25px 0 15px;
        }
        @media (prefers-color-scheme: dark) {
          body {
            background-color: ${brand.darkBg} !important;
            color: #e6edf3 !important;
          }
          .container {
            background-color: ${brand.darkCard} !important;
          }
          .footer {
            background: ${brand.darkBg} !important;
            color: #999 !important;
          }
          .divider {
            background-color: #30363d !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <img src="https://novaxpress.co.ke/Logo.jpg" alt="NovaXpress Logo" width="120" />
          <h1>Password Reset Request</h1>
        </div>

        <!-- Body -->
        <div class="body">
          <h2>Hello ${name || 'there'},</h2>
          <p>We received a request to reset your NovaXpress password.</p>
          <p>Click the button below to create a new password:</p>

          <div class="cta">
            <a href="${resetLink}" target="_blank">Reset Password 🔒</a>
          </div>

          <p style="font-size: 14px; color: #666;">
            This link will expire in <strong>15 minutes</strong> for your security.
            <br/><br/>
            If you didn’t request a password reset, you can safely ignore this email — your account will remain secure.
          </p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="divider"></div>
          <p>Need help? Contact us at 
            <a href="mailto:support@novaxpress.shop" style="color:${primary};text-decoration:none;">support@novaxpress.shop</a>
          </p>
          <p style="font-size:12px;margin-top:10px;">
            © ${new Date().getFullYear()} NovaXpress. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
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
