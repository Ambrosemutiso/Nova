import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/dbConnect';
import Seller from '@/app/models/seller';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { provider } = body; // 'google' or 'email'

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider type is required' },
        { status: 400 }
      );
    }

    // -------------------------------
    // 🔹 GOOGLE LOGIN / REGISTER
    // -------------------------------
    if (provider === 'google') {
      const { name, email, image, role, phoneNumber, country, currency, plan } = body;

      if (!email) {
        return NextResponse.json(
          { success: false, message: 'Email is required' },
          { status: 400 }
        );
      }

      let seller = await Seller.findOne({ email });

      if (!seller) {
        seller = await Seller.create({
          name,
          email,
          image,
          role: role || 'seller',
          phoneNumber: phoneNumber || null,
          country: country || null,
          currency: currency || null,
          plan: plan || 'free',
        });
      } else {
        if (!seller.plan) seller.plan = 'free';
        if (!seller.phoneNumber && phoneNumber) seller.phoneNumber = phoneNumber;
        await seller.save();
      }

      const token = jwt.sign(
        { id: seller._id, email: seller.email, role: seller.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return NextResponse.json({ success: true, user: seller, token });
    }

    // -------------------------------
    // 🔹 EMAIL/PASSWORD LOGIN & REGISTER
    // -------------------------------
    else if (provider === 'email') {
      const { mode, name, email, password, phoneNumber, country, plan } = body;

      if (!email || !password) {
        return NextResponse.json(
          { success: false, message: 'Email and password are required' },
          { status: 400 }
        );
      }

      let seller = await Seller.findOne({ email });

      // 🔸 REGISTER
      if (mode === 'register') {
        if (seller) {
          return NextResponse.json(
            { success: false, message: 'Seller already exists' },
            { status: 400 }
          );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        seller = await Seller.create({
          name,
          email,
          password: hashedPassword,
          role: 'seller',
          phoneNumber,
          country,
          plan: plan || 'free',
        });

        return NextResponse.json({
          success: true,
          message: 'Seller registered successfully',
        });
      }

      // 🔸 LOGIN
      else if (mode === 'login') {
        if (!seller) {
          return NextResponse.json(
            { success: false, message: 'Seller not found' },
            { status: 404 }
          );
        }

        const validPassword = await bcrypt.compare(password, seller.password);
        if (!validPassword) {
          return NextResponse.json(
            { success: false, message: 'Invalid credentials' },
            { status: 401 }
          );
        }

        const token = jwt.sign(
          { id: seller._id, email: seller.email, role: seller.role },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return NextResponse.json({ success: true, user: seller, token });
      }

      return NextResponse.json(
        { success: false, message: 'Invalid mode (expected login/register)' },
        { status: 400 }
      );
    }

    // -------------------------------
    // ❌ INVALID PROVIDER
    // -------------------------------
    return NextResponse.json(
      { success: false, message: 'Unsupported provider' },
      { status: 400 }
    );
  } catch (err) {
    console.error('Error in seller auth:', err);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
