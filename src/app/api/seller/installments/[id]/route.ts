import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/app/models/product";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const product = await Product.findById(params.id);

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    const body = await req.json();

    const updated = await Product.findByIdAndUpdate(params.id, body, { new: true });

    if (!updated) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Installment update error:", error);
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}
