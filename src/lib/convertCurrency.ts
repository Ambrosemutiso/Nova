let rateCache: Record<string, number> = {};
let lastFetched = 0;

export async function getExchangeRate(from: string, to: string) {
  const key = `${from}_${to}`;

  // return cached value if fresh (1 hour cache)
  if (rateCache[key] && Date.now() - lastFetched < 60 * 60 * 1000) {
    return rateCache[key];
  }

  const res = await fetch(`https://api.exchangerate.host/convert?from=${from}&to=${to}`);
  const data = await res.json();

  const rate = data?.info?.rate || 1;

  rateCache[key] = rate;
  lastFetched = Date.now();

  return rate;
}

// Formats: 2000 → “KES 2,000” / “TZS 48,000” / “$15”
export function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // fallback if currency not supported
    return `${currency} ${amount.toLocaleString()}`;
  }
}
