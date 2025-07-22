import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Logistics from '@/app/models/Logistics';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_ecom';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    await dbConnect();

    const user = await Logistics.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user._id, role: 'logistics' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create response with cookie
    const res = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

    // Set cookie
    res.cookies.set('logisticsToken', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return res;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
