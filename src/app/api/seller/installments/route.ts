import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/app/models/product";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const sellerId = req.nextUrl.searchParams.get("sellerId");
    if (!sellerId) {
      return NextResponse.json(
        { success: false, message: "Missing sellerId" },
        { status: 400 }
      );
    }

    const products = await Product.find({ sellerId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("Installment products fetch error", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
