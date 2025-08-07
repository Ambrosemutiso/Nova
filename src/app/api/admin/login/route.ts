import { NextRequest, NextResponse } from 'next/server';
import Admin from '@/app/models/Admin';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/dbConnect';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email, password } = await req.json();

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
  }

  return NextResponse.json({ message: 'Login successful' });
}
