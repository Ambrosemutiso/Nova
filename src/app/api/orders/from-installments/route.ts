import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';
import Installment from '@/app/models/InstallmentOrder';
import Product from '@/app/models/product';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { installmentId, county, town, userId, deliveryFee = 0 } =
      await req.json();

    if (!installmentId || !county || !town || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    /* =========================
       📦 Fetch installment (NO LEAN)
       ========================= */
    const installment = await Installment.findById(installmentId);

    if (!installment) {
      return NextResponse.json(
        { error: 'Installment not found' },
        { status: 404 }
      );
    }

    if (installment.status !== 'completed') {
      return NextResponse.json(
        { error: 'Installment not fully paid' },
        { status: 400 }
      );
    }

    if (installment.orderId) {
      return NextResponse.json(
        { error: 'Order already created' },
        { status: 409 }
      );
    }

    /* =========================
       🛒 Fetch product (LEAN OK)
       ========================= */
    const product = (await Product.findById(
      installment.productId
    ).lean()) as any;

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    /* =========================
       🧾 Build items (cart-compatible)
       ========================= */
    const items = [
      {
        name: String(product.name),
        quantity: 1,
        price: Number(product.price),
        images: Array.isArray(product.images) ? product.images : [],
        productId: product._id.toString(),
        sellerId: product.sellerId,
        fulfillmentMode: product.fulfillmentMode,
      },
    ];

    /* =========================
       🧾 Create order
       ========================= */
    const order = await Order.create({
      userId: new mongoose.Types.ObjectId(userId),
      items,
      totalAmount: Number(product.price),
      deliveryFee: Number(deliveryFee),
      customerInfo: { county, town },
      status: 'paid',
      paymentInfo: {
        method: 'installment',
        installmentId: installment._id,
      },
    });

    /* =========================
       🔗 Link order to installment
       ========================= */
    installment.orderId = order._id;
    await installment.save();

    return NextResponse.json({
      success: true,
      orderId: order._id,
    });
  } catch (err) {
    console.error('Installment → Order error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}