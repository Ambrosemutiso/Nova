import { NextRequest, NextResponse } from 'next/server';
import Order from '@/app/models/orders';
import { dbConnect } from '@/lib/dbConnect';

// Type for individual item in CallbackMetadata
type CallbackItem = {
  Name: string;
  Value: string | number;
};

// Type for stkCallback structure
type STKCallback = {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: {
    Item: CallbackItem[];
  };
};

// Type for the entire callback body
type MPESACallbackBody = {
  Body: {
    stkCallback: STKCallback;
  };
};

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { Body }: MPESACallbackBody = await req.json();

    const stkCallback = Body?.stkCallback;
    const resultCode = stkCallback?.ResultCode;
    const checkoutRequestID = stkCallback?.CheckoutRequestID;

    console.log('✅ M-PESA Callback received:', stkCallback);

    // Find the order associated with the M-PESA transaction
    const order = await Order.findOne({ checkoutRequestId: checkoutRequestID });

    if (!order) {
      console.error('❌ Order not found for CheckoutRequestID:', checkoutRequestID);
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    if (resultCode === 0) {
      // ✅ Payment successful
      const metadata = stkCallback.CallbackMetadata?.Item ?? [];

      const mpesaReceiptNumber = metadata.find((item: CallbackItem) => item.Name === 'MpesaReceiptNumber')?.Value || '';
      const amount = metadata.find((item: CallbackItem) => item.Name === 'Amount')?.Value || 0;
      const phone = metadata.find((item: CallbackItem) => item.Name === 'PhoneNumber')?.Value || '';

      order.status = 'Paid';
      order.mpesaReceiptNumber = String(mpesaReceiptNumber);
      order.paidAmount = Number(amount);
      order.paidPhone = String(phone);
      await order.save();

      console.log('💰 Payment successful for order:', order._id);
    } else {
      // ❌ Payment failed or cancelled
      order.status = 'Cancelled';
      await order.save();

      console.warn('⚠️ Payment failed or cancelled. Order status updated.');
    }

    return NextResponse.json({ message: 'Callback received' });
  } catch (err) {
    console.error('❌ Error processing MPESA callback:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
