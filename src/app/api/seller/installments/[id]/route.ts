import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/app/models/product";

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  try {
    await dbConnect();

    const { id } = context.params; // MATCHES YOUR OTHER PRODUCT ROUTES

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing productId" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        installmentEnabled: body.installmentEnabled,
        installmentDepositPercent: body.installmentDepositPercent,
        installmentMonths: body.installmentMonths,
        installmentPolicy: body.installmentPolicy,
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (err) {
    console.error("Update installment settings error:", err);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}
