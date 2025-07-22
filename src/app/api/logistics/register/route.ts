import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/dbConnect';
import Logistics from '@/app/models/Logistics'; // Adjust to your schema location

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();
    await dbConnect();

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const existing = await Logistics.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return NextResponse.json({ error: 'User already exists.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newLogistics = new Logistics({ name, email, phone, password: hashedPassword });
    await newLogistics.save();

    return NextResponse.json({ message: 'Registered successfully!' });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
