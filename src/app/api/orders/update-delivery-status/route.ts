// PATCH /api/orders/update-delivery-status
import Order from '@/app/models/orders';
import { dbConnect } from '@/lib/dbConnect';

export async function PATCH(req: Request) {
  await dbConnect();
  const { orderId, status } = await req.json();

  const order = await Order.findById(orderId);
  if (!order) {
    return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
  }

  order.deliveryStatus = status;
  await order.save();

  return new Response(JSON.stringify({ message: 'Delivery status updated' }));
}
