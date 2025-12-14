import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Seller from "@/app/models/seller";
import Product from "@/app/models/product";

// GET /api/seller/shop/[sellerId]
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ sellerId: string }> }
) {
  try {
    // Resolve dynamic route param
    const { sellerId } = await context.params;

    if (!sellerId) {
      return NextResponse.json(
        { error: "Seller ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Read optional query params
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    // Fetch seller
    const seller = await Seller.findById(sellerId);
    if (!seller || !seller.shop?.isActive) {
      return Response.json({ error: 'Shop not found or inactive' }, { status: 404 });
    }

    // Build product filter
    const productFilter: Record<string, any> = { sellerId };

    if (category) {
      productFilter.category = new RegExp(`^${category}$`, "i");
    }

    // Fetch seller products
    const products = await Product.find(productFilter).lean();

    return NextResponse.json({
      success: true,
      seller,
      products,
    });
  } catch (error) {
    console.error("Shop fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
