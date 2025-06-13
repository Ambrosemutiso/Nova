import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/app/models/orders';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

interface CartItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();

    const {
      items,
      customerInfo,
      userId,
      deliveryFee,
      totalAmount,
    }: {
      items: CartItem[];
      customerInfo: CustomerInfo;
      userId: string;
      deliveryFee: number;
      totalAmount: number;
    } = body;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item: CartItem) => ({
        price_data: {
          currency: 'kes',
          unit_amount: item.price * 100,
          product_data: {
            name: item.name,
            description: item.description || 'No description provided',
            images: item.image ? [item.image] : [],
          },
        },
        quantity: item.quantity,
      })
    );

    if (deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'kes',
          unit_amount: deliveryFee * 100,
          product_data: {
            name: 'Delivery Fee',
            description: `Delivery to ${customerInfo.city}`,
            images: [],
          },
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      customer_email: customerInfo.email,
      metadata: {
        userId,
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
      },
    });

    // ✅ Save order without paymentIntentId for now
    await Order.create({
      userId,
      items,
      customerInfo,
      deliveryFee,
      totalAmount,
      stripeSessionId: session.id,
      paymentIntentId: '', // Optional or leave out from schema
    });

    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json(
      { error: 'Failed to create Stripe checkout session' },
      { status: 500 }
    );
  }
}
