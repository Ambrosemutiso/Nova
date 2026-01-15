import { NextRequest } from 'next/server';
import Order from '@/app/models/orders';
import Product from '@/app/models/product';
import { initiateSTKPush } from '@/lib/mpesa';
import { dbConnect } from '@/lib/dbConnect';

export async function POST(req: NextRequest) {
  await dbConnect();

  const {
    phone,
    totalAmount,
    customerInfo,
    items,
    deliveryFee,
    userId,
  } = await req.json();

  try {
    // 1️⃣ Fetch products
    const productIds = items.map((item: any) => item.productId || item.id);
    const products = await Product.find({ _id: { $in: productIds } });

    // 2️⃣ Enrich items
    const enrichedItems = items.map((item: any) => {
      const productId = item.productId || item.id;
      const product = products.find(
        (p) => p._id.toString() === productId
      );

      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      return {
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        images: product.images,
        sellerId: product.sellerId,
        status: 'Pending',
      };
    });

    // 3️⃣ Create order
    const order = await Order.create({
      userId,
      items: enrichedItems,
      customerInfo,
      totalAmount,
      deliveryFee,
      status: 'Pending',
      createdAt: new Date(),
    });

    // 4️⃣ Trigger M-Pesa STK Push (GLOBAL reference)
    await initiateSTKPush({
      phone,
      amount: totalAmount,
      accountReference: `ORDER-${order._id}`,
      description: 'Order Payment',
    });

    return Response.json({ success: true, orderId: order._id });

  } catch (err) {
    console.error('[Checkout Error]', err);
    return Response.json(
      { error: 'Checkout failed' },
      { status: 500 }
    );
  }
}
