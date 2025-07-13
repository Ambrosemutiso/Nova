// POST /api/checkout/mpesa
import { NextRequest } from 'next/server';
import Order from '@/app/models/orders';
import { initiateSTKPush } from '@/lib/mpesa';

export async function POST(req: NextRequest) {
  try {
    const { phone, totalAmount, customerInfo, items, deliveryFee, userId } = await req.json();

    // Validate that each item has a sellerId (optional but good practice)
    for (const item of items) {
      if (!item.sellerId) {
        return new Response(JSON.stringify({ error: 'Each item must include sellerId' }), { status: 400 });
      }
    }

    const order = await Order.create({
      userId,
      items,
      customerInfo,
      totalAmount,
      deliveryFee,
      status: 'Pending',
      createdAt: new Date(),
    });

    await initiateSTKPush({
      phone,
      amount: totalAmount,
      orderId: order._id,
    });

    return Response.json({ orderId: order._id });
  } catch (err) {
    console.error('[M-Pesa Checkout Error]', err);
    return new Response(
      JSON.stringify({ error: 'Checkout failed', details: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500 }
    );
  }
}
