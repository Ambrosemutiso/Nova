import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/app/models/product";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ sellerId: string }> }
) {
  try {
    const { sellerId } = await context.params;

    if (!sellerId) {
      return NextResponse.json(
        { success: false, message: "Seller ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // ✅ Fetch ALL products from this seller
    const products = await Product.find({
      sellerId
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Products by seller error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
