// POST /api/checkout/mpesa/callback
import Order from '@/app/models/order';

export async function POST(req) {
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
      receipt: metadata?.Item?.find(i => i.Name === 'MpesaReceiptNumber')?.Value,
      phone: metadata?.Item?.find(i => i.Name === 'PhoneNumber')?.Value,
      amount: metadata?.Item?.find(i => i.Name === 'Amount')?.Value,
    };
  } else {
    // Cancelled / failed
    order.status = 'Cancelled';
  }

  await order.save();

  return Response.json({ message: 'Callback handled' });
}
