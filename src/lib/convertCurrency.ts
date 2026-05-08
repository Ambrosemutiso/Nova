// utils/currency.ts
export type CurrencyCode = "KES" | "UGX" | "TZS" | "USD";

//Local fallback rates
const FALLBACK_RATES: Record<CurrencyCode, Record<CurrencyCode, number>> = {
  KES: { KES: 1, UGX: 27.5,  TZS: 18.3, USD: 0.0071 },
  UGX: { UGX: 1, KES: 0.036, TZS: 0.66, USD: 0.00026 },
  TZS: { TZS: 1, KES: 0.055, UGX: 1.52, USD: 0.00039 },
  USD: { USD: 1, KES: 129.0, UGX: 3875, TZS: 2550 },
};

// Fetch live rate with retry + timeout 
async function fetchRate(from: CurrencyCode, to: CurrencyCode): Promise<number> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://api.exchangerate.host/convert?from=${from}&to=${to}`,
      { signal: controller.signal }
    );

    clearTimeout(timer);

    if (!res.ok) throw new Error("API error");

    const json = await res.json();

    // Validate response
    if (!json.result || typeof json.result !== "number" || json.result <= 0) {
      console.warn(`Invalid live rate for ${from} → ${to}. Using fallback.`);
      return FALLBACK_RATES[from][to];
    }

    return json.result;

  } catch (err) {
    console.warn(`Live rate fetch failed (${from}→${to}). Using fallback.`);
    return FALLBACK_RATES[from][to];
  }
}

// Public function
export async function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): Promise<number> {
  if (from === to) return amount;

  const rate = await fetchRate(from, to);

  return amount * rate;
}

//Format output
export function formatCurrency(amount: number, currency: CurrencyCode) {
  const symbols: Record<CurrencyCode, string> = {
    KES: "KSh",
    UGX: "USh",
    TZS: "TSh",
    USD: "$",
  };

  return `${symbols[currency]} ${amount.toLocaleString()}`;
}

// Convert Array of Products
export async function convertProducts(products: any[], userCurrency: CurrencyCode) {
  const converted = [];

  for (const p of products) {
    const displayPrice = await convertCurrency(p.calculatedPrice, p.currency || "KES", userCurrency);

    const displayOldPrice = p.oldPrice
      ? await convertCurrency(p.oldPrice, p.currency || "KES", userCurrency)
      : null;

    converted.push({
      ...p,
      displayPrice,
      displayOldPrice,
      displayCurrency: userCurrency,
    });
  }

  return converted;
}
