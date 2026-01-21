type Client = {
  controller: ReadableStreamDefaultController;
};

const clients = new Map<string, Client>();

export function registerClient(
  paymentIntentId: string,
  controller: ReadableStreamDefaultController
) {
  clients.set(paymentIntentId, { controller });
}

export function notifyClient(paymentIntentId: string, data: any) {
  const client = clients.get(paymentIntentId);
  if (!client) return;

  try {
    client.controller.enqueue(
      `event: payment\ndata: ${JSON.stringify(data)}\n\n`
    );
    client.controller.close();
  } catch (err) {
    console.error('SSE notify failed', err);
  } finally {
    clients.delete(paymentIntentId);
  }
}
