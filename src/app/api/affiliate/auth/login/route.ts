import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/dbConnect';
import Affiliate from '@/app/models/Affiliate';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_ecom';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required.' }, { status: 400 });
    }

    const affiliate = await Affiliate.findOne({ email });
    if (!affiliate) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, affiliate.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 });
    }

    const token = jwt.sign(
      { id: affiliate._id, email: affiliate.email, role: 'affiliate' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const res = NextResponse.json({ success: true });

    res.cookies.set({
      name: 'affiliateToken',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
