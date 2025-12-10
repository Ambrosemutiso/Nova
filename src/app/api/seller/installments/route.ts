import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/app/models/product";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("sellerId");

    if (!sellerId) {
      return NextResponse.json(
        { success: false, message: "Missing sellerId" },
        { status: 400 }
      );
    }

    const products = await Product.find({ sellerId }).sort({ createdAt: -1 });

    // DO NOT override _id — send products exactly as they are
    return NextResponse.json({ success: true, data: products });
  } catch (err) {
    console.error("Fetch seller products error:", err);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}
