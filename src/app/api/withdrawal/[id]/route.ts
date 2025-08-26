import { dbConnect } from "@/lib/dbConnect";
import WithdrawRequest from "@/app/models/withdrawRequest";
import { NextRequest, NextResponse } from "next/server";

// ✅ Approve or Reject a withdrawal
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { action }: { action: "approve" | "reject" } = await req.json();

  try {
    await dbConnect();

    const withdrawal = await WithdrawRequest.findById(id);
    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    // ✅ update status
    withdrawal.status = action === "approve" ? "approved" : "rejected";
    await withdrawal.save();

    return NextResponse.json({ success: true, withdrawal }, { status: 200 });
  } catch (error) {
    console.error("Error updating withdrawal:", error);
    return NextResponse.json({ error: "Failed to update withdrawal" }, { status: 500 });
  }
}
