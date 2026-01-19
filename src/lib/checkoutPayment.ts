import { toast } from 'react-toastify';

export type CheckoutPayload = {
  phone: string;
  method: 'mpesa' | 'airtel' | 'npay';
  amount: number;
  items?: any[];
  deliveryFee?: number;
  county?: string;
  town?: string;
  userId: string;
  purpose: 'order' | 'installment-deposit' | 'installment-monthly' | 'wallet';
  refId: string;
  onSuccess: () => void;
  onFailure?: () => void;
};

export async function initiateCheckoutPayment(payload: CheckoutPayload) {
  const { phone, method, amount, items, deliveryFee, county, town, userId, purpose, refId, onSuccess, onFailure } = payload;

  try {
    toast.loading(`Waiting for ${method === 'mpesa' ? 'M-Pesa' : method === 'airtel' ? 'Airtel' : 'N-Pay'} confirmation...`);
    const normalizedPhone = phone.replace(/^0/, '254');

    if (method === 'npay') {
      toast.dismiss();
      toast.success('Payment successful via N-PAY');
      onSuccess();
      return;
    }

    // 1️⃣ Initiate payment intent
    const res = await fetch('/api/payments/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: normalizedPhone, method, amount, items, deliveryFee, county, town, userId, purpose, refId }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Payment initiation failed');

    const paymentIntentId = result.paymentIntentId;

    // 2️⃣ SSE listener for real-time updates
    const eventSource = new EventSource(`/api/payments/stream?paymentIntentId=${paymentIntentId}`);

    eventSource.addEventListener('payment', (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      toast.dismiss();

      if (data.status === 'paid') {
        toast.success('Payment successful!');
        onSuccess(); // wallet balance can refresh here
      } else {
        toast.error('Payment failed');
        onFailure?.();
      }

      eventSource.close();
    });

    eventSource.onerror = () => {
      eventSource.close();
      toast.dismiss();
      toast.error('Connection lost');
      onFailure?.();
    };
  } catch (err: any) {
    toast.dismiss();
    toast.error(err.message || 'Payment error');
    onFailure?.();
  }
}
