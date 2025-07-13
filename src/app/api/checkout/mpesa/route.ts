import { NextRequest } from 'next/server'; 
import Order from '@/app/models/orders';
import Product from '@/app/models/product';
import { initiateSTKPush } from '@/lib/mpesa';
import { dbConnect } from '@/lib/dbConnect';

export async function POST(req: NextRequest) {
  await dbConnect(); // Ensure DB connection

  const { phone, totalAmount, customerInfo, items, deliveryFee, userId } = await req.json();

  try {
    // Step 1: Get product details using productId fallback
    const productIds = items.map((item: any) => item.productId || item.id);
    const products = await Product.find({ _id: { $in: productIds } });

    // Step 2: Attach sellerId to each item
    const enrichedItems = items.map((item: any) => {
      const productId = item.productId || item.id;
      const product = products.find(p => p._id.toString() === productId);

      if (!product) throw new Error(`Product not found: ${productId}`);

      return {
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        images: product.images,
        sellerId: product.sellerId,
        status: 'Pending',
      };
    });

    // Step 3: Create order
    const order = await Order.create({
      userId,
      items: enrichedItems,
      customerInfo,
      totalAmount,
      deliveryFee,
      status: 'Pending',
      createdAt: new Date(),
    });

    // Step 4: Trigger M-Pesa STK push
    await initiateSTKPush({
      phone,
      amount: totalAmount,
      orderId: order._id,
    });

    return Response.json({ orderId: order._id });

  } catch (err) {
    console.error('[Checkout Error]', err);
    return new Response(JSON.stringify({ error: 'Checkout failed' }), { status: 500 });
  }
}
