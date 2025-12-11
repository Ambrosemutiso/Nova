import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Installment from "@/app/models/InstallmentOrder";
import Product from "@/app/models/product";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { productId, months, buyerId, deposit } = await req.json();

    if (!productId || !months || !buyerId) {
      return NextResponse.json(
        { error: "Missing fields (buyerId, productId, months required)" },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!product.sellerId) {
      return NextResponse.json({ error: "Product missing sellerId" }, { status: 400 });
    }

    const totalAmount = product.calculatedPrice;
    const monthlyAmount = Math.round((totalAmount - Number(deposit || 0)) / months);

    const installment = await Installment.create({
      buyerId,
      sellerId: product.sellerId,
      productId,
      totalAmount,
      monthlyAmount,
      months,
      depositPaid: false,
      status: "pending-deposit",
    });

    return NextResponse.json({
      success: true,
      installmentId: installment._id,
      totalAmount,
      monthlyAmount,
    });

  } catch (error) {
    console.error("Installment create error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

