import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/app/models/product";

// GET /api/seller/installments/[id]
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await dbConnect();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// PUT /api/seller/installments/[id]
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await dbConnect();
    const body = await req.json();

    const updated = await Product.findByIdAndUpdate(id, body, { new: true });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Installment update error:", error);
    return NextResponse.json(
      { success: false, message: "Update failed" },
      { status: 500 }
    );
  }
}
