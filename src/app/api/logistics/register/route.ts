import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/dbConnect';
import LogisticsPartner from '@/app/models/LogisticsPartner';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { name, phone, password } = await req.json();

  if (!name || !phone || !password) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const existing = await LogisticsPartner.findOne({ phone });
  if (existing) {
    return NextResponse.json({ error: 'Phone already in use' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const partner = await LogisticsPartner.create({ name, phone, password: hashedPassword });

  return NextResponse.json({ message: 'Partner registered', partner });
}
