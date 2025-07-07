// POST /api/checkout/mpesa/callback
import { NextRequest } from 'next/server';
import Order from '@/app/models/orders';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const resultCode = body.Body.stkCallback.ResultCode;
  const merchantRequestID = body.Body.stkCallback.MerchantRequestID;
  const checkoutRequestID = body.Body.stkCallback.CheckoutRequestID;

  const metadata = body.Body.stkCallback.CallbackMetadata;

  const order = await Order.findOne({ checkoutRequestID }); // You must save this ID when initiating STK push

  if (!order) return new Response('Order not found', { status: 404 });

  if (resultCode === 0) {
    // Successful payment
    order.status = 'Paid';
order.paymentInfo = {
  receipt: metadata?.Item?.find(
    (i: { Name: string; Value: any }) => i.Name === 'MpesaReceiptNumber'
  )?.Value,
  phone: metadata?.Item?.find(
    (i: { Name: string; Value: any }) => i.Name === 'PhoneNumber'
  )?.Value,
  amount: metadata?.Item?.find(
    (i: { Name: string; Value: any }) => i.Name === 'Amount'
  )?.Value,
};

  } else {
    // Cancelled / failed
    order.status = 'Cancelled';
  }

  await order.save();

  return Response.json({ message: 'Callback handled' });
}
