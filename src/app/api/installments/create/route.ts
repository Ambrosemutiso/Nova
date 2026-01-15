import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Installment from "@/app/models/InstallmentOrder";
import Product from "@/app/models/product";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { buyerId, productId } = await req.json();

    if (!buyerId || !productId) {
      return NextResponse.json(
        { error: "Missing buyerId or productId" },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const months = product.installmentMonths;
    const deposit = product.depositAmount || 0;
    const totalAmount = product.calculatedPrice;

    if (!months || months <= 0) {
      return NextResponse.json(
        { error: "Installments not enabled for this product" },
        { status: 400 }
      );
    }

    const monthlyAmount = Math.round(
      (totalAmount - deposit) / months
    );

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
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


