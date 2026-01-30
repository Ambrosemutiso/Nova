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

    if (!mongoose.Types.ObjectId.isValid(installmentId)) {
      return NextResponse.json(
        { error: 'Invalid installment ID' },
        { status: 400 }
      );
    }

    const installment = await Installment.findById(installmentId).lean<{
      _id: mongoose.Types.ObjectId;
      status: string;
      orderId?: mongoose.Types.ObjectId;
      product?: any;
      productId?: any;
    }>();

    if (!installment) {
      return NextResponse.json(
        { error: 'Installment not found' },
        { status: 404 }
      );
    }

    /* ✅ Must be fully paid */
    if (installment.status !== 'completed') {
      return NextResponse.json(
        { error: 'Installment not fully paid' },
        { status: 400 }
      );
    }

    /* ✅ Prevent duplicate orders */
    if (installment.orderId) {
      return NextResponse.json(
        { error: 'Order already created' },
        { status: 409 }
      );
    }

    /* ======================================================
       🧩 Normalize product (matches frontend normalization)
       ====================================================== */
    let product: any | null = null;

    if (installment.product) {
      product = installment.product;
    } else if (
      installment.productId &&
      mongoose.Types.ObjectId.isValid(installment.productId)
    ) {
      product = await Product.findById(installment.productId).lean();
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found for installment' },
        { status: 404 }
      );
    }

    /* ======================================================
       🧾 Create order
       ====================================================== */
    const order = await Order.create({
      userId,
      items: [
        {
          productId: product._id,
          name: product.name,
          quantity: 1,
          price: product.price,
          images: product.images ?? [],
          sellerId: product.sellerId,
          fulfillmentMode: product.fulfillmentMode,
        },
      ],
      totalAmount: Number(product.price),
      deliveryFee: Number(deliveryFee),
      customerInfo: { county, town },
      status: 'paid',
      paymentInfo: {
        method: 'installment',
        installmentId: installment._id,
      },
    });

    /* ======================================================
       🔗 Link order back to installment
       ====================================================== */
    await Installment.findByIdAndUpdate(installmentId, {
      orderId: order._id,
    });

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
