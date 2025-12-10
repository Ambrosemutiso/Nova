import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/app/models/product";

export async function PUT(req: NextRequest, { params }: any) {
  try {
    await dbConnect();
    const productId = params.id;

    const {
      installmentEnabled,
      installmentDepositPercent,
      installmentMonths,
      installmentPolicy
    } = await req.json();

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        installmentEnabled,
        installmentDepositPercent,
        installmentMonths,
        installmentPolicy
      },
      { new: true }
    );

    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error("Update installment settings error:", err);
    return NextResponse.json({ success: false, error: "Server error" });
  }
}
