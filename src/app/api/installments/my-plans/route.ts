import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Installment from "@/app/models/InstallmentOrder";
import Product from "@/app/models/product";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const buyerId = req.headers.get("buyer-id");
    if (!buyerId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const plans = await Installment.find({ buyerId })
      .sort({ createdAt: -1 })
      .lean();

    const enrichedPlans = await Promise.all(
      plans.map(async (plan) => {
        const product = await Product.findById(plan.productId).lean();

        return {
          ...plan,
          product: product ?? null,
          paidAmount: Number(plan.paidAmount ?? 0),
          totalAmount: Number(plan.totalAmount ?? 0),
          monthlyAmount: Number(plan.monthlyAmount ?? 0),
        };
      })
    );

    return NextResponse.json({ plans: enrichedPlans });
  } catch (err) {
    console.error("Installment plans error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
