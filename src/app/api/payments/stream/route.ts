import { NextRequest } from 'next/server';
import { registerClient } from '@/lib/paymentStream';

export async function GET(req: NextRequest) {
  const paymentIntentId = req.nextUrl.searchParams.get('paymentIntentId');
  if (!paymentIntentId) {
    return new Response('Missing paymentIntentId', { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      registerClient(paymentIntentId, controller);
      controller.enqueue(': connected\n\n');
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
