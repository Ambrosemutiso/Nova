// POST /api/checkout/mpesa
import Order from '@/app/models/orders'; 
import { initiateSTKPush } from '@/lib/mpesa'; 

export async function POST(req) {
  const { phone, totalAmount, customerInfo, items, deliveryFee, userId } = await req.json();

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
}
