import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/app/models/product";

export async function PUT(req: Request, { params }: any) {
  try {
    await dbConnect();
    const productId = params.id;
    const { 
      installmentEnabled, 
      depositPercent, 
      months, 
      policy 
    } = await req.json();

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        installmentEnabled,
        installmentDepositPercent: depositPercent,
        installmentMonths: months,
        installmentPolicy: policy
      },
      { new: true }
    );

    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error("Update installment settings error:", err);
    return NextResponse.json({ success: false, error: "Server error" });
  }
}
