//app/api/payments/status/route.ts
import { NextRequest } from 'next/server';
import PaymentIntent from '@/app/models/paymentIntent';
import { dbConnect } from '@/lib/dbConnect';

export async function GET(req: NextRequest) {
  await dbConnect();

  const paymentIntentId =
    req.nextUrl.searchParams.get('paymentIntentId');

  if (!paymentIntentId) {
    return Response.json(
      { error: 'Missing paymentIntentId' },
      { status: 400 }
    );
  }

  const intent = await PaymentIntent.findById(paymentIntentId);

  if (!intent) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json({ status: intent.status });
}

