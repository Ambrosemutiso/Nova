import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/app/models/user';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { provider } = body;

    if (!provider) {
      return NextResponse.json({ success: false, error: 'Provider is required' }, { status: 400 });
    }

    // --------------------------
    // 🔹 GOOGLE AUTHENTICATION
    // --------------------------
    if (provider === 'google') {
      const { name, email, image, role, phoneNumber, country, currency } = body;

      if (!email) {
        return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
      }

      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name,
          email,
          image,
          role,
          phoneNumber: phoneNumber || null,
          country: country || null,
          currency: currency || null,
          isPhoneVerified: false,
        });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        success: true,
        token,
        user,
        needsPhoneNumber: !user.phoneNumber || !user.isPhoneVerified,
      });
    }

    // --------------------------
    // 🔹 EMAIL / PASSWORD AUTH
    // --------------------------
    else if (provider === 'email') {
      const { name, email, password, role, mode } = body; // mode = 'login' or 'signup'

      if (!email || !password) {
        return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
      }

      let user = await User.findOne({ email });

      // SIGNUP FLOW
      if (mode === 'signup') {
        if (user) {
          return NextResponse.json({ success: false, error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = await User.create({
          name,
          email,
          password: hashedPassword,
          role: role || 'buyer',
          isPhoneVerified: false,
        });
      }

      // LOGIN FLOW
      else if (mode === 'login') {
        if (!user) {
          return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
        }
      } else {
        return NextResponse.json({ success: false, error: 'Invalid mode' }, { status: 400 });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        success: true,
        token,
        user,
      });
    }

    // Unknown provider
    return NextResponse.json({ success: false, error: 'Unsupported provider' }, { status: 400 });

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}
