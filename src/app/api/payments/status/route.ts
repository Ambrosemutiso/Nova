import { NextRequest } from 'next/server';
import PaymentIntent from '@/app/models/paymentIntent';
import { dbConnect } from '@/lib/dbConnect';

export async function GET(req: NextRequest) {
  await dbConnect();

  const intentId = req.nextUrl.searchParams.get('intentId');
  if (!intentId) {
    return Response.json({ error: 'Missing intentId' }, { status: 400 });
  }

  const intent = await PaymentIntent.findById(intentId);

  if (!intent) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json({ status: intent.status });
}
