// GET /api/orders/status
import Order from '@/app/models/orders';

export async function GET(req) {
  const orderId = new URL(req.url).searchParams.get('orderId');

  const order = await Order.findById(orderId);
  if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });

  return Response.json({ status: order.status });
}
