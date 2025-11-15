// app/api/products/all/route.ts
import { NextResponse } from "next/server";
import Product from "@/app/models/product";
import { dbConnect } from "@/lib/dbConnect";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const category = url.searchParams.get('category'); // optional category filter
    const sort = url.searchParams.get('sort') || 'name-asc';

    // Build filter
    const filter: any = {};
    if (category) filter.category = category;

    // Sorting
    const sortOptions: any = {};
    if (sort === 'name-asc') sortOptions.name = 1;
    if (sort === 'name-desc') sortOptions.name = -1;
    if (sort === 'price-asc') sortOptions.price = 1;
    if (sort === 'price-desc') sortOptions.price = -1;

    // Fetch all matching products (no pagination)
    const products = await Product.find(filter).sort(sortOptions).lean();

    // Extract unique brands
    const brands = Array.from(new Set(products.map(p => p.brand)));

    // Return consistent shape
    return NextResponse.json({
      total: products.length,
      products,
      brands
    });
  } catch (err) {
    console.error("❌ Failed to fetch products:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
