import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import {dbConnect} from '@/lib/dbConnect';
import Affiliate from '@/app/models/Affiliate';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, email, phoneNumber, password } = await req.json();

    if (!name || !email || !phoneNumber || !password)
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });

    const existing = await Affiliate.findOne({ email });
    if (existing)
      return NextResponse.json({ error: 'Email already registered.' }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);

    const affiliate = await Affiliate.create({
      name,
      email,
      phoneNumber,
      password: hashed,
    });

    return NextResponse.json({ success: true, message: 'Registered successfully.', data: affiliate });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
