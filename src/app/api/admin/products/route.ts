import { NextRequest, NextResponse } from "next/server";
import {dbConnect} from "@/lib/dbConnect";
import Product from "@/app/models/product";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    // Safely parse params
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const sortBy = searchParams.get("sortBy") ?? "createdAt";
    const order = searchParams.get("order") === "asc" ? 1 : -1;

    const category = searchParams.get("category") ?? "";
    const minPrice = parseFloat(searchParams.get("minPrice") ?? "0");
    const maxPrice = parseFloat(
      searchParams.get("maxPrice") ?? `${Number.MAX_SAFE_INTEGER}`
    );
    const search = searchParams.get("search") ?? "";

    // Build filter
    const filter: Record<string, any> = {
      ...(category && { category }),
      price: { $gte: minPrice, $lte: maxPrice },
      ...(search && { name: { $regex: search, $options: "i" } }),
    };

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort({ [sortBy]: order })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
