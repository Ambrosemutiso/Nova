import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/app/models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'novaxpress_secret_123'; // replace in prod with env var

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const {
      provider, // "google" | "email"
      mode, // "login" | "signup" for email
      name,
      email,
      password,
      image,
      role,
      phoneNumber,
      country,
    } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // -------------------------------
    // 🔹 GOOGLE LOGIN OR SIGNUP
    // -------------------------------
    if (provider === 'google') {
      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          name,
          email,
          image,
          role,
          country: country || null,
          phoneNumber: phoneNumber || null,
          isPhoneVerified: false,
        });
      }

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return NextResponse.json({ success: true, user, token });
    }

    // -------------------------------
    // 🔹 EMAIL LOGIN / SIGNUP
    // -------------------------------
    if (provider === 'email') {
      // Signup
      if (mode === 'signup') {
        if (!password || !name || !country || !phoneNumber) {
          return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const existing = await User.findOne({ email });
        if (existing) {
          return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 400 });
        }

        const hashed = await bcrypt.hash(password, 10);
        const newUser = await User.create({
          name,
          email,
          password: hashed,
          role,
          phoneNumber,
          country,
          isPhoneVerified: false,
        });

        const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
        return NextResponse.json({ success: true, user: newUser, token });
      }

      // Login
      if (mode === 'login') {
        const user = await User.findOne({ email });
        if (!user || !user.password) {
          return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        return NextResponse.json({ success: true, user, token });
      }
    }

    return NextResponse.json({ success: false, error: 'Invalid provider or mode' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}
