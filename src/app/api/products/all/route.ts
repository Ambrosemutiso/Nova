import { NextRequest, NextResponse } from "next/server";
import Product from "@/app/models/product";
import { dbConnect } from "@/lib/dbConnect";

// ---- SIMPLE BUILT-IN CACHED RATE FETCHER ----
let rateCache: Record<string, number> = {};
let lastFetched = 0;

async function fetchRate(from: string, to: string) {
  const key = `${from}_${to}`;

  // return cached rate if it's fresh (1 hour)
  if (rateCache[key] && Date.now() - lastFetched < 60 * 60 * 1000) {
    return rateCache[key];
  }

  try {
    const res = await fetch(`https://api.exchangerate.host/convert?from=${from}&to=${to}`);
    const data = await res.json();

    const rate = data?.info?.rate || 1;

    rateCache[key] = rate;
    lastFetched = Date.now();

    return rate;
  } catch (err) {
    console.error("⚠️ Exchange rate API failed, falling back to 1:1");
    return 1;
  }
}

// ---- CURRENCY FORMATTER ----
function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

// ---- MAIN API ----
export async function POST(req: NextRequest) {
  await dbConnect();
  const { userCurrency } = await req.json();

  // Missing currency fallback
  const targetCurrency = userCurrency || "KES";

  const products = await Product.find().lean();

  const modified = await Promise.all(
    products.map(async (p) => {
      const sellerCurrency = p.currency || "KES";

      // Convert 3 price fields safely
      const rate = sellerCurrency === targetCurrency 
        ? 1 
        : await fetchRate(sellerCurrency, targetCurrency);

      const convertedPrice = Math.round((p.price || p.calculatedPrice) * rate);
      const convertedOldPrice = Math.round((p.oldPrice || 0) * rate);
      const convertedCalculatedPrice = Math.round((p.calculatedPrice || p.price) * rate);

      return {
        ...p,

        // new values
        displayPrice: convertedPrice,
        displayOldPrice: convertedOldPrice,
        displayCalculatedPrice: convertedCalculatedPrice,
        displayCurrency: targetCurrency,

        // formatted values (optional, useful for frontend)
        formattedPrice: formatCurrency(convertedPrice, targetCurrency),
        formattedOldPrice: formatCurrency(convertedOldPrice, targetCurrency),
        formattedCalculatedPrice: formatCurrency(convertedCalculatedPrice, targetCurrency),
      };
    })
  );

  return NextResponse.json(modified);
}
