import { toast } from 'react-toastify';

type PaymentCallbacks = {
  onSuccess?: () => void;
  onFailure?: () => void;
};

export async function initiateCheckoutPayment(
  payload: any & PaymentCallbacks
) {
  const toastId = toast.loading('Waiting for M-Pesa confirmation...');

  try {
    const res = await fetch('/api/payments/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message);

    const paymentIntentId = result.paymentIntentId;
    let resolved = false;

    const safeSuccess = () => {
      if (typeof payload.onSuccess === 'function') {
        payload.onSuccess();
      }
    };

    const safeFailure = () => {
      if (typeof payload.onFailure === 'function') {
        payload.onFailure();
      }
    };

    // 🔥 SSE
    const es = new EventSource(
      `/api/payments/stream?paymentIntentId=${paymentIntentId}`
    );

    es.addEventListener('payment', (e) => {
      if (resolved) return;
      resolved = true;

      const data = JSON.parse(e.data);

      toast.update(toastId, {
        render: data.status === 'paid'
          ? 'Payment successful!'
          : 'Payment failed',
        type: data.status === 'paid' ? 'success' : 'error',
        isLoading: false,
        autoClose: 3000,
      });

      data.status === 'paid' ? safeSuccess() : safeFailure();
      es.close();
    });

    // ⏱️ POLLING FALLBACK
    const poll = setInterval(async () => {
      if (resolved) return clearInterval(poll);

      const r = await fetch(
        `/api/payments/status?id=${paymentIntentId}`
      );
      const { status } = await r.json();

      if (status === 'paid' || status === 'failed') {
        resolved = true;
        clearInterval(poll);
        es.close();

        toast.update(toastId, {
          render: status === 'paid'
            ? 'Payment successful!'
            : 'Payment failed',
          type: status === 'paid' ? 'success' : 'error',
          isLoading: false,
          autoClose: 3000,
        });

        status === 'paid' ? safeSuccess() : safeFailure();
      }
    }, 4000);
  } catch (err: any) {
    toast.update(toastId, {
      render: err.message || 'Payment error',
      type: 'error',
      isLoading: false,
      autoClose: 3000,
    });

    if (typeof payload.onFailure === 'function') {
      payload.onFailure();
    }
  }
}
