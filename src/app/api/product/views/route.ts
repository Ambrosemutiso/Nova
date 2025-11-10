import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/app/models/product";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { productId, sellerId, bounced = false } = await req.json();

    if (!productId || !sellerId) {
      return NextResponse.json({ error: "Missing productId or sellerId" }, { status: 400 });
    }

    const update: Record<string, any> = {
      $inc: { views: 1, visits: 1 },
      $set: { updatedAt: new Date() },
    };

    if (bounced) {
      update.$inc.bounces = 1;
    }

    await Product.findByIdAndUpdate(productId, update, { new: true });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Product view update error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
