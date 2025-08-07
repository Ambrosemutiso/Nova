import { NextRequest, NextResponse } from 'next/server';
import Admin from '@/app/models/Admin';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/dbConnect';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email, password, confirmPassword, name, securityQuestion, securityAnswer } = await req.json();

  const existing = await Admin.findOne({});
  if (existing) {
    return NextResponse.json({ message: 'Admin already exists' }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ message: 'Passwords do not match' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const hashedAnswer = await bcrypt.hash(securityAnswer.toLowerCase(), 10);

  await Admin.create({
    email,
    password: hashedPassword,
    name,
    securityQuestion,
    securityAnswer: hashedAnswer,
  });

  return NextResponse.json({ message: 'Admin registered successfully' });
}
