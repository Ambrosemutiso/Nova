import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { orderId, itemId, newStatus } = req.body;

  if (!orderId || !itemId || !newStatus) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const item = order.items.id(itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found in order' });
    }

    item.status = newStatus;
    await order.save();

    return res.status(200).json({ message: 'Item status updated successfully', order });
  } catch (error) {
    console.error('Error updating item status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
