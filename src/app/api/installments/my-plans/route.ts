import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Installment from "@/app/models/InstallmentOrder";
import Product from "@/app/models/product";
import Payment from "@/app/models/InstallmentPayment";

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

    // Fetch the buyer’s active/pending installment plans
    const plans = await Installment.find({
      buyerId,
      status: { $in: ["active", "pending-deposit"] },
    }).lean();

    if (!plans.length) {
      return NextResponse.json({ plans: [] });
    }

    // Attach product + payment data
    const enrichedPlans = await Promise.all(
      plans.map(async (plan) => {
        const product = await Product.findById(plan.productId).lean();

        // IMPORTANT: match the model field name: planId
        const payments = await Payment.find({
          planId: plan._id
        }).lean();

        const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);

        return {
          ...plan,
          product,
          paidAmount,
          totalAmount: plan.totalAmount,
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
