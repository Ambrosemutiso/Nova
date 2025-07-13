import { NextRequest } from 'next/server';
import Order from '@/app/models/orders'; 
import Product from '@/app/models/product';
import { initiateSTKPush } from '@/lib/mpesa'; 

export async function POST(req: NextRequest) {
  const { phone, totalAmount, customerInfo, items, deliveryFee, userId } = await req.json();

  try {
    const productIds = items.map((item: any) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    const enrichedItems = items.map((item: any) => {
      const product = products.find(p => p._id.toString() === item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);

      return {
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.image,
        sellerId: product.sellerId,
        status: 'Pending',
      };
    });

    const order = await Order.create({
      userId,
      items: enrichedItems,
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

    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error occurred';

    return new Response(
      JSON.stringify({ error: 'Checkout failed', details: errorMessage }),
      { status: 500 }
    );
  }
}
