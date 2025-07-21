// POST /api/orders/assign-logistics
import Order from '@/app/models/orders';
import LogisticsPartner from '@/app/models/LogisticsPartner';
import { dbConnect } from '@/lib/dbConnect';

export async function POST(req: Request) {
  await dbConnect();
  const { orderId, partnerId } = await req.json();

  const order = await Order.findById(orderId);
  const partner = await LogisticsPartner.findById(partnerId);

  if (!order || !partner) {
    return new Response(JSON.stringify({ error: 'Order or Partner not found' }), { status: 404 });
  }

  if (!partner.isAvailable) {
    return new Response(JSON.stringify({ error: 'Partner not available' }), { status: 400 });
  }

  order.logisticsPartner = partner._id;
  order.deliveryStatus = 'picked';
  await order.save();

  partner.assignedOrders.push(order._id);
  partner.isAvailable = false;
  await partner.save();

  return new Response(JSON.stringify({ message: 'Logistics partner assigned successfully' }));
}
