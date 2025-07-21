import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/dbConnect';
import LogisticsPartner from '@/app/models/LogisticsPartner';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  await dbConnect();
  const { phone, password } = await req.json();

  const partner = await LogisticsPartner.findOne({ phone });
  if (!partner) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, partner.password);
  if (!isMatch) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = jwt.sign({ id: partner._id }, JWT_SECRET, { expiresIn: '7d' });

  return NextResponse.json({ token, partner: { id: partner._id, name: partner.name } });
}