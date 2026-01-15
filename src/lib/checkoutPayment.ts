import { toast } from 'react-toastify';

type CheckoutPayload = {
  phone: string;
  method: 'mpesa' | 'airtel' | 'npay';
  totalAmount: number;
  items: any[];
  deliveryFee: number;
  county: string;
  town: string;
  userId: string;
  purpose: 'order' | 'installment-deposit' | 'installment-monthly';
  refId: string; 
  onSuccess: () => void;
  onFailure?: () => void;
};

export async function initiateCheckoutPayment(payload: CheckoutPayload) {
  const {
    phone,
    method,
    totalAmount,
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
    toast.loading(`Waiting for ${method === 'mpesa' ? 'M-Pesa' : 'Airtel'} confirmation...`);

    const normalizedPhone = phone.replace(/^0/, '254');
const endpoint =
  method === 'mpesa'
    ? '/api/checkout/mpesa'
    : method === 'airtel'
    ? '/api/checkout/airtel'
    : '/api/checkout/npay';

    if (method === 'npay') {
  toast.dismiss();
  toast.success('Payment successful via N-PAY');
  onSuccess();
  return;
}

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: normalizedPhone,
        totalAmount,
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
    if (!res.ok) throw new Error(result.message);

    const orderId = result.orderId;
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      const statusRes = await fetch(`/api/orders/status?orderId=${orderId}`);
      const status = await statusRes.json();

      if (status.status === 'Paid') {
        clearInterval(interval);
        toast.dismiss();
        toast.success('Payment successful!');
        onSuccess();
      }

      if (status.status === 'Cancelled' || attempts >= 10) {
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
