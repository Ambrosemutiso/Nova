import { NextRequest, NextResponse } from 'next/server';
import PaymentIntent from '@/app/models/paymentIntent';
import { dbConnect } from '@/lib/dbConnect';

export async function GET(req: NextRequest) {
  await dbConnect();

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ status: 'unknown' });

  const intent = await PaymentIntent.findById(id);
  if (!intent) return NextResponse.json({ status: 'unknown' });

  return NextResponse.json({ status: intent.status });
}
