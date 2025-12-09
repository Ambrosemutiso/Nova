import { NextResponse } from "next/server";
import Product from "@/app/models/product";
import { dbConnect } from "@/lib/dbConnect";

export async function GET() {
  try {
    await dbConnect();

    const products = await Product.find({
      installmentAvailable: true,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Installment products error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
