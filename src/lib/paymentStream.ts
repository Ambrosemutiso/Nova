type Client = {
  controller: ReadableStreamDefaultController;
};

const clients = new Map<string, Set<Client>>();

export function registerClient(
  paymentIntentId: string,
  controller: ReadableStreamDefaultController
) {
  const set = clients.get(paymentIntentId) ?? new Set<Client>();
  set.add({ controller });
  clients.set(paymentIntentId, set);
}

export function notifyClient(paymentIntentId: string, data: any) {
  const set = clients.get(paymentIntentId);
  if (!set) return;

  for (const client of set) {
    try {
      client.controller.enqueue(
        `event: payment\ndata: ${JSON.stringify(data)}\n\n`
      );
      client.controller.close();
    } catch (err) {
      // controller may already be closed — safe to ignore
    }
  }

  clients.delete(paymentIntentId);
}
