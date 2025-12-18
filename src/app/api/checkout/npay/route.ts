import { NextRequest } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';
import Product from '@/app/models/product';
import User from '@/app/models/user'; // or Wallet model

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const {
      totalAmount,
      items,
      deliveryFee,
      county,
      town,
      userId,
    } = await req.json();

    // 🔒 Validate amount
    const amount = Math.round(Number(totalAmount));
    if (!amount || amount < 1) {
      return Response.json(
        { message: 'Invalid amount' },
        { status: 400 }
      );
    }

    // 🔒 Validate user
    const user = await User.findById(userId);
    if (!user) {
      return Response.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // 🔒 Check Nova Coins balance
    if (user.novaCoins < amount) {
      return Response.json(
        { message: 'Insufficient Nova Coins balance' },
        { status: 400 }
      );
    }

    // 🛒 Fetch products
    const productIds = items.map((item: any) => item.productId || item.id);
    const products = await Product.find({ _id: { $in: productIds } });

    // 🧩 Enrich order items
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
        status: 'Paid',
      };
    });

    // 💸 Deduct Nova Coins (atomic intent)
    user.novaCoins -= amount;
    await user.save();

    // 📦 Create order (PAID instantly)
    const order = await Order.create({
      userId,
      items: enrichedItems,
      totalAmount: amount,
      deliveryFee,
      customerInfo: { county, town },
      paymentMethod: 'N-PAY',
      status: 'Paid',
      paidAt: new Date(),
      createdAt: new Date(),
    });

    // 📤 Success
    return Response.json({
      orderId: order._id,
      message: 'Payment successful via N-PAY',
    });

  } catch (error: any) {
    console.error('[N-PAY CHECKOUT ERROR]', error);

    return Response.json(
      { message: 'N-PAY checkout failed' },
      { status: 500 }
    );
  }
}
