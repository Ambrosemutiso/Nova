// /lib/checkoutPayment.ts
import { toast } from 'react-toastify';

export type CheckoutPayload = {
  phone: string;
  method: 'mpesa' | 'airtel' | 'npay';

  amount: number;

  // Optional business data (used by backend)
  items?: any[];
  deliveryFee?: number;
  county?: string;
  town?: string;

  userId: string;

  // 🔑 What is being paid for
  purpose: 'order' | 'installment-deposit' | 'installment-monthly' | 'wallet';

  // 🔗 Reference ID
  // orderId OR installmentId
  refId: string;

  onSuccess: () => void;
  onFailure?: () => void;
};

export async function initiateCheckoutPayment(payload: CheckoutPayload) {
  const {
    phone,
    method,
    amount,
    items,
    deliveryFee,
    county,
    town,
    userId,
    purpose,
    refId,
    onSuccess,
    onFailure,
  } = payload;

  try {
    toast.loading(
      `Waiting for ${
        method === 'mpesa' ? 'M-Pesa' : method === 'airtel' ? 'Airtel' : 'N-Pay'
      } confirmation...`
    );

    // 🧼 Normalize phone
    const normalizedPhone = phone.replace(/^0/, '254');

    // 💳 N-PAY shortcut
    if (method === 'npay') {
      toast.dismiss();
      toast.success('Payment successful via N-PAY');
      onSuccess();
      return;
    }

    // 🚀 Initiate payment intent
    const res = await fetch('/api/payments/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: normalizedPhone,
        method,
        amount,
        items,
        deliveryFee,
        county,
        town,
        userId,
        purpose,
        refId,
      }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Payment initiation failed');

    const paymentIntentId = result.paymentIntentId;

    // 🔁 Poll payment status
    let attempts = 0;
    const maxAttempts = 12;

    const interval = setInterval(async () => {
      attempts++;

      const statusRes = await fetch(
        `/api/payments/status?paymentIntentId=${paymentIntentId}`
      );
      const status = await statusRes.json();

      if (status.status === 'SUCCESS') {
        clearInterval(interval);
        toast.dismiss();
        toast.success('Payment successful!');
        onSuccess();
      }

      if (
        status.status === 'FAILED' ||
        status.status === 'CANCELLED' ||
        attempts >= maxAttempts
      ) {
        clearInterval(interval);
        toast.dismiss();
        toast.error('Payment failed or timed out');
        onFailure?.();
      }
    }, 3000);
  } catch (err: any) {
    toast.dismiss();
    toast.error(err.message || 'Payment error');
    onFailure?.();
  }
}
