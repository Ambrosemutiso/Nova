// /lib/paymentStream.ts
type Client = {
  id: string;
  controller: ReadableStreamDefaultController;
};

const clients = new Map<string, Client>();

export function registerClient(paymentIntentId: string, controller: ReadableStreamDefaultController) {
  clients.set(paymentIntentId, { id: paymentIntentId, controller });
}

export function notifyClient(paymentIntentId: string, data: any) {
  const client = clients.get(paymentIntentId);
  if (!client) return;

  try {
    client.controller.enqueue(`event: payment\ndata: ${JSON.stringify(data)}\n\n`);
    client.controller.close();
  } catch (err) {
    console.error('Failed to notify client', err);
  } finally {
    clients.delete(paymentIntentId);
  }
}
